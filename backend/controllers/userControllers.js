const User = require("../models/userModel");
const Otp = require("../models/otpModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { issueOtp, consumeOtp, otpErrorMessage } = require("../utils/otp");
const { sendOtpEmail } = require("../utils/mailer");

// Short-lived token that authorises exactly one password reset.
function signResetToken(email) {
    return jwt.sign(
        { email: String(email).toLowerCase(), purpose: "password-reset" },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
    );
}

// User Registration — creates an unverified account and emails an OTP.
const register = async (req, res) => {
    try {
        const userExists = await User.findOne({ email: req.body.email }).maxTimeMS(5000);
        if (userExists) {
            // Stale unverified account holding the address: let them retry
            // verification instead of hard-blocking re-registration.
            if (userExists.isVerified === false) {
                const otp = await issueOtp(userExists.email, "register");
                let sent = false;
                try {
                    ({ sent } = await sendOtpEmail(userExists.email, otp, "register"));
                } catch (mailError) {
                    console.error('OTP email failed:', mailError.message);
                }
                return res.status(200).send({
                    message: "This email is already registered but not verified. A fresh code was sent.",
                    success: true,
                    needsVerification: true,
                    email: userExists.email,
                    emailSent: sent,
                });
            }
            return res.status(409).send({
                message: "User already exists.",
                success: false,
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            isAdmin: req.body.isAdmin,
            isVerified: false,
        });

        await newUser.save();

        const otp = await issueOtp(newUser.email, "register");
        // Email delivery must never fail registration: the code is always
        // issued and logged, the response just reports whether it was mailed.
        let sent = false;
        try {
            ({ sent } = await sendOtpEmail(newUser.email, otp, "register"));
        } catch (mailError) {
            console.error('OTP email failed:', mailError.message);
        }

        res.status(201).send({
            message: sent
                ? "Registered. Enter the 6-digit code sent to your email."
                : "Registered, but the verification email could not be sent. Use resend, or the code in the server log.",
            success: true,
            needsVerification: true,
            email: newUser.email,
            emailSent: sent,
        });
    } catch (error) {
        console.error('Error in register:', error);
        res.status(500).send({
            message: "Error registering user",
            data: null,
            success: false,
        });
    }
};

// User Login
const login = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email }).maxTimeMS(5000);
        if (!user) {
            return res.status(404).send({
                message: "User does not exist.",
                success: false,
            });
        }
        const passwordsMatched = await bcrypt.compare(req.body.password, user.password);
        if (!passwordsMatched) {
            return res.status(401).send({
                message: "Invalid password.",
                success: false,
            });
        }
        // Accounts created before verification existed have no flag (undefined)
        // and keep working; only explicit false is blocked.
        if (user.isVerified === false) {
            return res.status(403).send({
                message: "Email not verified yet. Enter the code sent to your email.",
                success: false,
                needsVerification: true,
                email: user.email,
            });
        }
        const token = jwt.sign(
            {
                userid: user._id,
                email: user.email,
                isAdmin: user.isAdmin,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.send({
            message: "User logged in successfully.",
            data: token,
            success: true,
        });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).send({
            message: "Error logging in.",
            data: null,
            success: false,
        });
    }
};

const getUserInfo = async (req, res) => {
    try {
        const user = await User.findById(req.body.userid).maxTimeMS(5000);
        if (!user) {
            return res.status(404).send({
                message: "User not found.",
                success: false,
            });
        }

        // Self-heal gamification fields for users created before the system
        let needsSave = false;
        if (user.xp === undefined || user.xp === null) { user.xp = 0; needsSave = true; }
        if (user.level === undefined || user.level === null) { user.level = 1; needsSave = true; }
        if (!Array.isArray(user.badges)) { user.badges = []; needsSave = true; }
        if (!user.stats) {
            user.stats = {
                totalQuizzesCompleted: 0,
                totalCorrectAnswers: 0,
                totalQuestionsAttempted: 0,
                perfectScores: 0,
                passedQuizzes: 0,
                currentStreak: 0,
                longestStreak: 0,
            };
            needsSave = true;
        } else {
            for (const k of ["totalQuizzesCompleted", "totalCorrectAnswers", "totalQuestionsAttempted", "perfectScores", "passedQuizzes", "currentStreak", "longestStreak"]) {
                if (user.stats[k] === undefined) { user.stats[k] = 0; needsSave = true; }
            }
        }
        if (needsSave) await user.save();

        const safeUser = user.toObject();
        delete safeUser.password;

        res.status(200).send({
            message: "User info fetched successfully.",
            data: safeUser,
            success: true,
        });
    } catch (error) {
        console.error('Error in getUserInfo:', error);
        res.status(500).send({
            message: "Error fetching user info.",
            data: null,
            success: false,
        });
    }
};

// Resend the registration OTP.
const sendVerificationOtp = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email }).maxTimeMS(5000);
        if (!user) {
            return res.status(404).send({ message: "User does not exist.", success: false });
        }
        if (user.isVerified !== false) {
            return res.send({ message: "Email is already verified. You can log in.", success: true, alreadyVerified: true });
        }
        const otp = await issueOtp(user.email, "register");
        let sent = false;
        try {
            ({ sent } = await sendOtpEmail(user.email, otp, "register"));
        } catch (mailError) {
            console.error('OTP email failed:', mailError.message);
        }
        res.send({
            message: sent ? "A fresh code was sent to your email." : "Email could not be sent. Use resend, or the code in the server log.",
            success: true,
            emailSent: sent,
        });
    } catch (error) {
        console.error('Error in sendVerificationOtp:', error);
        res.status(500).send({ message: "Error sending code.", data: null, success: false });
    }
};

// Verify a registration OTP and activate the account.
const verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).send({ message: "Email and code are required.", success: false });
        }
        const user = await User.findOne({ email }).maxTimeMS(5000);
        if (!user) {
            return res.status(404).send({ message: "User does not exist.", success: false });
        }
        if (user.isVerified !== false) {
            return res.send({ message: "Email is already verified. You can log in.", success: true, alreadyVerified: true });
        }
        const result = await consumeOtp(email, "register", String(otp).trim());
        if (!result.ok) {
            return res.status(400).send({ message: otpErrorMessage(result.reason), success: false, attemptsLeft: result.attemptsLeft });
        }
        user.isVerified = true;
        await user.save();
        res.send({ message: "Email verified. You can now log in.", success: true });
    } catch (error) {
        console.error('Error in verifyEmail:', error);
        res.status(500).send({ message: "Error verifying email.", data: null, success: false });
    }
};

// Start password reset. Always generic so addresses can't be enumerated.
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).send({ message: "Email is required.", success: false });
        }
        const user = await User.findOne({ email }).maxTimeMS(5000);
        if (user) {
            const otp = await issueOtp(user.email, "reset");
            try {
                await sendOtpEmail(user.email, otp, "reset");
            } catch (mailError) {
                console.error('OTP email failed:', mailError.message);
            }
        }
        res.send({
            message: "If an account exists for this email, a 6-digit code is on its way.",
            success: true,
        });
    } catch (error) {
        console.error('Error in forgotPassword:', error);
        res.status(500).send({ message: "Error starting password reset.", data: null, success: false });
    }
};

// Verify a reset OTP and return a short-lived reset token.
const verifyResetOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).send({ message: "Email and code are required.", success: false });
        }
        const result = await consumeOtp(email, "reset", String(otp).trim());
        if (!result.ok) {
            return res.status(400).send({ message: otpErrorMessage(result.reason), success: false, attemptsLeft: result.attemptsLeft });
        }
        res.send({
            message: "Code accepted. Set a new password.",
            success: true,
            data: { resetToken: signResetToken(email), email: String(email).toLowerCase() },
        });
    } catch (error) {
        console.error('Error in verifyResetOtp:', error);
        res.status(500).send({ message: "Error verifying code.", data: null, success: false });
    }
};

// Set a new password with a valid reset token. Also verifies the email,
// since presenting the token proves ownership of the address.
const resetPassword = async (req, res) => {
    try {
        const { resetToken, newPassword } = req.body;
        if (!resetToken || !newPassword) {
            return res.status(400).send({ message: "Reset token and new password are required.", success: false });
        }
        if (String(newPassword).length < 6) {
            return res.status(400).send({ message: "Password must be at least 6 characters.", success: false });
        }
        let payload;
        try {
            payload = jwt.verify(resetToken, process.env.JWT_SECRET);
        } catch (e) {
            return res.status(400).send({ message: "This reset link has expired. Start again.", success: false });
        }
        if (payload.purpose !== "password-reset" || !payload.email) {
            return res.status(400).send({ message: "Invalid reset token.", success: false });
        }
        const user = await User.findOne({ email: payload.email }).maxTimeMS(5000);
        if (!user) {
            return res.status(404).send({ message: "User does not exist.", success: false });
        }
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        user.isVerified = true;
        await user.save();
        await Otp.deleteMany({ email: user.email });
        res.send({ message: "Password updated. Log in with the new password.", success: true });
    } catch (error) {
        console.error('Error in resetPassword:', error);
        res.status(500).send({ message: "Error resetting password.", data: null, success: false });
    }
};

module.exports = { register, login, getUserInfo, sendVerificationOtp, verifyEmail, forgotPassword, verifyResetOtp, resetPassword };
