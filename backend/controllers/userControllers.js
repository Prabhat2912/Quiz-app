const User = require("../models/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// User Registration
const register = async (req, res) => {
    try {
        const userExists = await User.findOne({ email: req.body.email }).maxTimeMS(5000);
        if (userExists) {
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
        });

        await newUser.save();
        res.status(201).send({
            message: "User registered successfully.",
            success: true,
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

        res.status(200).send({
            message: "User info fetched successfully.",
            data: user,
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

module.exports = { register, login, getUserInfo };
