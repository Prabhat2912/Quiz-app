const mongoose = require('mongoose')
const Question = require("./questionModel")

const examSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    // Content language of title/questions/options/explanations.
    // Older exams predate the field and read as English.
    language: {
        type: String,
        enum: ["en", "hi"],
        default: "en"
    },
    totalMarks: {
        type: Number,
        required: true
    },
    passingMarks: {
        type: Number,
        required: true
    },
    questions: {
        type: [mongoose.Schema.Types.ObjectId],
        required: true,
        ref: "questions"  
    },
},{
    timestamps: true
})

// remove all the questions associated with an exam if that exam is deleted
examSchema.post('remove',async function(res, next){
    await Question.deleteMany({exam: this._id});
    next();
})

const examModel = mongoose.model("exams", examSchema)

module.exports = examModel