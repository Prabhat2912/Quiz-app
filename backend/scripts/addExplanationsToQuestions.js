const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const Question = require('../models/questionModel');
const Exam = require('../models/examModel');
const { chat } = require('../config/geminiConfig');

const addExplanationsToQuestions = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');

        // Find all questions without explanations
        const questionsWithoutExplanations = await Question.find({
            $or: [
                { explanation: { $exists: false } },
                { explanation: "" },
                { explanation: null }
            ]
        }).populate('exam');

        console.log(`Found ${questionsWithoutExplanations.length} questions without explanations`);

        if (questionsWithoutExplanations.length === 0) {
            console.log('All questions already have explanations!');
            process.exit(0);
        }

        let successCount = 0;
        let failCount = 0;

        // Process each question
        for (let i = 0; i < questionsWithoutExplanations.length; i++) {
            const question = questionsWithoutExplanations[i];

            console.log(`\nProcessing question ${i + 1}/${questionsWithoutExplanations.length}`);
            console.log(`Question: ${question.name.substring(0, 50)}...`);

            try {
                // Build correct answers string
                const correctAnswers = question.correctOptions.map(opt => `${opt}: ${question.options[opt]}`).join(', ');
                const allOptions = Object.entries(question.options).map(([key, value]) => `${key}: ${value}`).join('\n');
                const category = question.exam?.category || 'General';

                const prompt = `Generate a clear and concise explanation for the following question. Explain why the correct answer is right and provide educational context.

Question: ${question.name}
Category: ${category}

Options:
${allOptions}

Correct Answer(s): ${correctAnswers}

Provide a brief, educational explanation (2-3 sentences) that helps learners understand why this is the correct answer. Focus on the key concept or reasoning.`;

                // Generate explanation with timeout
                const aiTimeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('AI timeout')), 10000);
                });

                const aiResponse = await Promise.race([
                    chat(prompt),
                    aiTimeoutPromise
                ]);

                const explanation = aiResponse.response?.text() || aiResponse;
                const cleanedExplanation = explanation.trim();

                // Update the question
                question.explanation = cleanedExplanation;
                await question.save();

                console.log(`✅ Successfully added explanation`);
                successCount++;

                // Add a small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 1000));

            } catch (error) {
                console.error(`❌ Failed to generate explanation: ${error.message}`);
                failCount++;

                // Continue with next question even if one fails
                continue;
            }
        }

        console.log('\n===========================================');
        console.log('Migration Complete!');
        console.log(`✅ Success: ${successCount} questions`);
        console.log(`❌ Failed: ${failCount} questions`);
        console.log('===========================================\n');

        process.exit(0);

    } catch (error) {
        console.error('Error in migration:', error);
        process.exit(1);
    }
};

// Run the migration
addExplanationsToQuestions();
