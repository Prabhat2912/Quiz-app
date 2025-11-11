const mongoose = require("mongoose")

const badgeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: true
    },
    requirement: {
        type: String,
        required: true
    },
    criteria: {
        type: {
            type: String, // 'quizzes_completed', 'accuracy', 'streak', 'perfect_score', 'category_master'
            required: true
        },
        value: {
            type: Number,
            required: true
        },
        category: String // For category-specific badges
    }
}, {
    timestamps: true
})

const badgeModel = mongoose.model("badges", badgeSchema)
module.exports = badgeModel
