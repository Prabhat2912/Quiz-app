const mongoose = require("mongoose")

// Single-use email OTPs. Expired docs are removed automatically by TTL.
const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    otpHash: {
        type: String,
        required: true
    },
    purpose: {
        type: String,
        required: true,
        enum: ["register", "reset"]
    },
    attempts: {
        type: Number,
        default: 0
    },
    expiresAt: {
        type: Date,
        required: true
    }
}, {
    timestamps: true
})

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

const otpModel = mongoose.model("otps", otpSchema)
module.exports = otpModel
