const { chat } = require('../config/geminiConfig');
const Exam = require("../models/examModel");
const Question = require("../models/questionModel");
const User = require("../models/userModel");

const noOfQuestions = process.env.NO_OF_QUESTIONS;

const createExam = async (req, res) => {
    try {
        // Set a timeout for the entire operation
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Operation timeout')), 25000); // 25 seconds
        });

        const createExamPromise = async () => {
            const user = await User.findById(req.body.userid).maxTimeMS(5000);
            if (!user || !user.isAdmin) {
                return res.status(403).json({
                    message: "Only admin users can create exams",
                    success: false
                });
            }

            const { category, name, duration, totalMarks, passingMarks } = req.body;

            const examExists = await Exam.findOne({ name }).maxTimeMS(5000);
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

            console.log("Calling AI with prompt for category:", category);

            // Add timeout to AI call
            const aiTimeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('AI API timeout')), 20000); // 20 seconds for AI
            });

            const aiResponse = await Promise.race([
                chat(prompt),
                aiTimeoutPromise
            ]);

            console.log("AI Response received");

            let questions;
            try {
                const responseText = aiResponse.response?.text() || aiResponse;
                console.log("Raw Response Text length:", responseText.length);

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

                questions = JSON.parse(cleanedText);

                if (!Array.isArray(questions)) {
                    throw new Error("AI response is not an array");
                }

                // Limit questions to prevent timeout
                if (questions.length > 20) {
                    questions = questions.slice(0, 20);
                }

            } catch (parseError) {
                console.error("Error parsing AI response:", parseError);
                throw new Error(`Error parsing AI generated questions: ${parseError.message}`);
            }

            console.log(`Creating ${questions.length} questions`);

            // Use bulk insert for better performance
            const questionsToInsert = questions.map(questionData => ({
                name: questionData.name,
                correctOptions: questionData.correctOptions,
                options: questionData.options,
                exam: examId
            }));

            const createdQuestions = await Question.insertMany(questionsToInsert);

            // Update exam with question IDs
            savedExam.questions = createdQuestions.map(q => q._id);
            await savedExam.save();

            return {
                message: 'Exam created successfully with AI generated questions',
                success: true,
                data: {
                    exam: savedExam,
                    questionsCount: createdQuestions.length
                }
            };
        };

        const result = await Promise.race([createExamPromise(), timeoutPromise]);

        if (res.headersSent) return; // Prevent multiple responses

        res.status(201).json(result);

    } catch (error) {
        console.error("Error in createExam:", error);

        if (res.headersSent) return; // Prevent multiple responses

        if (error.message === 'Operation timeout' || error.message === 'AI API timeout') {
            res.status(408).json({
                message: "Request timeout. Please try again with a smaller number of questions.",
                success: false,
                error: "TIMEOUT"
            });
        } else {
            res.status(500).json({
                message: "Error creating exam",
                success: false,
                error: error.message
            });
        }
    }
}
module.exports = { createExam };

