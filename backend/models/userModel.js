const mongoose = require("mongoose")
const Report = require("./reportModel")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isAdmin: {
        type: Boolean,
        required: true,
        default: false
    },
    // Gamification features
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    badges: [{
        name: String,
        earnedAt: {
            type: Date,
            default: Date.now
        },
        description: String,
        icon: String
    }],
    stats: {
        totalQuizzesCompleted: {
            type: Number,
            default: 0
        },
        totalCorrectAnswers: {
            type: Number,
            default: 0
        },
        totalQuestionsAttempted: {
            type: Number,
            default: 0
        },
        currentStreak: {
            type: Number,
            default: 0
        },
        longestStreak: {
            type: Number,
            default: 0
        },
        lastQuizDate: Date
    }
}, {
    timestamps: true
})

// Delete reports of the user when a user is deleted
userSchema.post('remove', async function (res, next) {
    await Report.deleteMany({ user: this._id });
    next();
})

const userModel = mongoose.model("users", userSchema)
module.exports = userModel