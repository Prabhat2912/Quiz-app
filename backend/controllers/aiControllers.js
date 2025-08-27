const { chat } = require('../config/geminiConfig');
const Exam = require("../models/examModel");
const Question = require("../models/questionModel");
const User = require("../models/userModel");

const noOfQuestions = process.env.NO_OF_QUESTIONS;

const createExam = async (req, res) => {
    try {
        const user = await User.findById(req.body.userid);
        if (!user || !user.isAdmin) {
            return res.status(403).json({
                message: "Only admin users can create exams",
                success: false
            });
        }

        const { category, name, duration, totalMarks, passingMarks } = req.body;

        const examExists = await Exam.findOne({ name });
        if (examExists) {
            return res.status(409).json({
                message: "Exam already exists",
                success: false
            });
        }

        const newExam = new Exam({
            name,
            duration,
            category,
            totalMarks,
            passingMarks,
            questions: []
        });

        const savedExam = await newExam.save();
        const examId = savedExam._id;

        const prompt = `Create ${noOfQuestions} exam questions for the topic ${category}. The questions should be of type True/False or MCQ (including MCQs with multiple correct answers).
The output must be strictly in JSON format as an array of question objects with the following schema:
[
  {
    "name": "Question text here",
    "correctOptions": ["A"],
    "options": {
      "A": "Option A text",
      "B": "Option B text",
      "C": "Option C text",
      "D": "Option D text"
    }
  }
]
Rules:
- name: The question text as a string
- correctOptions: An array of strings containing the correct option labels (e.g., ["A"] or ["A","C"])
- options: An object where keys are option labels (A, B, C, D) and values are the option texts
- Return only valid JSON array, no extra text or formatting
- Make sure the JSON is valid and follows the schema exactly`;

        const aiResponse = await chat(prompt);
        console.log("AI Response:", aiResponse);

        let questions;
        try {
            const responseText = aiResponse.response?.text() || aiResponse;
            console.log("Raw Response Text:", responseText);

            // Clean the response text by removing markdown code blocks
            let cleanedText = responseText.trim();

            // Remove ```json from the beginning
            if (cleanedText.startsWith('```json')) {
                cleanedText = cleanedText.substring(7);
            } else if (cleanedText.startsWith('```')) {
                cleanedText = cleanedText.substring(3);
            }

            // Remove ``` from the end
            if (cleanedText.endsWith('```')) {
                cleanedText = cleanedText.substring(0, cleanedText.length - 3);
            }

            // Trim any remaining whitespace
            cleanedText = cleanedText.trim();

            console.log("Cleaned Text:", cleanedText);

            questions = JSON.parse(cleanedText);

            if (!Array.isArray(questions)) {
                throw new Error("AI response is not an array");
            }
        } catch (parseError) {
            console.error("Error parsing AI response:", parseError);
            return res.status(500).json({
                message: "Error parsing AI generated questions",
                success: false,
                error: parseError.message
            });
        }

        const createdQuestions = [];
        for (const questionData of questions) {
            try {
                const newQuestion = new Question({
                    name: questionData.name,
                    correctOptions: questionData.correctOptions,
                    options: questionData.options,
                    exam: examId
                });

                const savedQuestion = await newQuestion.save();
                createdQuestions.push(savedQuestion);

                savedExam.questions.push(savedQuestion._id);
            } catch (questionError) {
                console.error("Error saving question:", questionError);
            }
        }

        // Save exam with question IDs
        await savedExam.save();

        res.status(201).json({
            message: 'Exam created successfully with AI generated questions',
            success: true,
            data: {
                exam: savedExam,
                questionsCount: createdQuestions.length
            }
        });

    } catch (error) {
        console.error("Error in createExam:", error);
        res.status(500).json({
            message: "Error creating exam",
            success: false,
            error: error.message
        });
    }
}
module.exports = { createExam };

