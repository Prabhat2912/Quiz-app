const mongoose = require('mongoose');
const Exam = require("./examModel");

const questionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    correctOptions: { // Changed to an array to allow multiple correct answers
        type: [String], // Array of strings
        required: true
    },
    options: {
        type: Object,
        required: true
    },
    exam: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "exams",
        required: true
    },
}, {
    timestamps: true
});

// Remove question from the exam if the question is deleted
questionSchema.post('remove', async function (res, next) {
    await Exam.updateOne({ _id: this.exam }, {
        $pull: { questions: this._id }
    });
    next();
});

// Check if the model already exists, if not, create it
const questionModel = mongoose.models.questions || mongoose.model("questions", questionSchema);

module.exports = questionModel;
