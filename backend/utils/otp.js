const crypto = require("crypto")
const Otp = require("../models/otpModel")

const OTP_TTL_MS = 10 * 60 * 1000
const MAX_ATTEMPTS = 5

function hashOtp(otp) {
    return crypto.createHash("sha256").update(String(otp)).digest("hex")
}

// Issues a fresh 6-digit code, invalidating any previous ones for this email+purpose.
async function issueOtp(email, purpose) {
    const normalized = String(email).toLowerCase();
    const otp = String(crypto.randomInt(100000, 1000000))
    await Otp.deleteMany({ email: normalized, purpose })
    await Otp.create({
        email: normalized,
        otpHash: hashOtp(otp),
        purpose,
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
    })
    return otp
}

// Returns { ok:true } on success (code consumed), else { ok:false, reason }.
// Reasons: missing | expired | locked | mismatch (with attemptsLeft).
async function consumeOtp(email, purpose, otp) {
    const normalized = String(email).toLowerCase();
    const record = await Otp.findOne({ email: normalized, purpose }).sort({ createdAt: -1 })
    if (!record) return { ok: false, reason: "missing" }
    if (record.expiresAt < new Date()) {
        await Otp.deleteMany({ email: normalized, purpose })
        return { ok: false, reason: "expired" }
    }
    if (record.attempts >= MAX_ATTEMPTS) {
        await Otp.deleteMany({ email: normalized, purpose })
        return { ok: false, reason: "locked" }
    }
    const candidate = hashOtp(otp)
    const match =
        candidate.length === record.otpHash.length &&
        crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(record.otpHash))
    if (!match) {
        record.attempts += 1
        await record.save()
        return { ok: false, reason: "mismatch", attemptsLeft: MAX_ATTEMPTS - record.attempts }
    }
    await Otp.deleteMany({ email: normalized, purpose })
    return { ok: true }
}

function otpErrorMessage(reason) {
    switch (reason) {
        case "expired": return "That code has expired. Request a fresh one."
        case "locked": return "Too many wrong attempts. Request a fresh code."
        case "missing": return "No active code for this email. Request one first."
        default: return "That code does not match. Try again."
    }
}

module.exports = { issueOtp, consumeOtp, otpErrorMessage, OTP_TTL_MS, MAX_ATTEMPTS }
