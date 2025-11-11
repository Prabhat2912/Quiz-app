const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const User = require('../models/userModel');

const initializeUserGamification = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');

        // Find all users
        const users = await User.find({});
        console.log(`Found ${users.length} users`);

        let updatedCount = 0;

        for (const user of users) {
            let needsUpdate = false;

            // Initialize xp if not exists
            if (user.xp === undefined || user.xp === null) {
                user.xp = 0;
                needsUpdate = true;
            }

            // Initialize level if not exists
            if (user.level === undefined || user.level === null) {
                user.level = 1;
                needsUpdate = true;
            }

            // Initialize badges if not exists
            if (!user.badges || !Array.isArray(user.badges)) {
                user.badges = [];
                needsUpdate = true;
            }

            // Initialize stats if not exists
            if (!user.stats) {
                user.stats = {
                    totalQuizzesCompleted: 0,
                    totalCorrectAnswers: 0,
                    totalQuestionsAttempted: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                    lastQuizDate: null
                };
                needsUpdate = true;
            } else {
                // Ensure all stat fields exist
                if (user.stats.totalQuizzesCompleted === undefined) {
                    user.stats.totalQuizzesCompleted = 0;
                    needsUpdate = true;
                }
                if (user.stats.totalCorrectAnswers === undefined) {
                    user.stats.totalCorrectAnswers = 0;
                    needsUpdate = true;
                }
                if (user.stats.totalQuestionsAttempted === undefined) {
                    user.stats.totalQuestionsAttempted = 0;
                    needsUpdate = true;
                }
                if (user.stats.currentStreak === undefined) {
                    user.stats.currentStreak = 0;
                    needsUpdate = true;
                }
                if (user.stats.longestStreak === undefined) {
                    user.stats.longestStreak = 0;
                    needsUpdate = true;
                }
            }

            if (needsUpdate) {
                await user.save();
                console.log(`✅ Updated user: ${user.name} (${user.email})`);
                updatedCount++;
            } else {
                console.log(`⏭️  Skipped user: ${user.name} (already initialized)`);
            }
        }

        console.log('\n===========================================');
        console.log('Initialization Complete!');
        console.log(`✅ Updated: ${updatedCount} users`);
        console.log(`⏭️  Skipped: ${users.length - updatedCount} users`);
        console.log('===========================================\n');

        process.exit(0);

    } catch (error) {
        console.error('Error in initialization:', error);
        process.exit(1);
    }
};

// Run the script
initializeUserGamification();
