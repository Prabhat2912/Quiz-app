const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "exams",
        required: true
    },
    result: {
        type: Object,
        required: true
    },
    // Detailed answer tracking
    answers: [{
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOptions: [String],
        correctOptions: [String],
        isCorrect: Boolean,
        explanation: String
    }],
    // XP earned from this quiz
    xpEarned: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
})

const reportModel = mongoose.model("reports", reportSchema)
module.exports = reportModel