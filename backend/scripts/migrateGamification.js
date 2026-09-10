const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const User = require('../models/userModel');
const { calculateLevel, checkBadgesToAward } = require('../config/gamification');

const migrateGamification = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');
        console.log('Starting gamification migration (levels + badges + stats)...\n');

        const users = await User.find({});
        console.log(`Found ${users.length} users`);

        let updatedCount = 0;
        let badgesAwarded = 0;

        for (const user of users) {
            console.log(`\nProcessing: ${user.name} (${user.email})`);
            console.log(`  Before — XP: ${user.xp}, Level: ${user.level}, Badges: ${(user.badges || []).length}`);

            let changed = false;

            // Init missing fields
            if (user.xp == null) { user.xp = 0; changed = true; }
            if (!Array.isArray(user.badges)) { user.badges = []; changed = true; }
            if (!user.stats) {
                user.stats = {
                    totalQuizzesCompleted: 0, totalCorrectAnswers: 0, totalQuestionsAttempted: 0,
                    perfectScores: 0, passedQuizzes: 0, currentStreak: 0, longestStreak: 0,
                };
                changed = true;
            } else {
                for (const k of ["totalQuizzesCompleted", "totalCorrectAnswers", "totalQuestionsAttempted", "perfectScores", "passedQuizzes", "currentStreak", "longestStreak"]) {
                    if (user.stats[k] == null) { user.stats[k] = 0; changed = true; }
                }
            }

            // Recalculate level with new progressive formula
            const newLevel = calculateLevel(user.xp || 0);
            if (user.level !== newLevel) {
                console.log(`  Level ${user.level} -> ${newLevel}`);
                user.level = newLevel;
                changed = true;
            }

            // Award any missing badges (accuracy unknown here, so 0 — level/quiz/streak badges still apply)
            const missing = checkBadgesToAward(user, 0);
            if (missing.length > 0) {
                console.log(`  Awarding ${missing.length}: ${missing.map((b) => b.name).join(', ')}`);
                user.badges = [...user.badges, ...missing];
                badgesAwarded += missing.length;
                changed = true;
            }

            if (changed) {
                await user.save();
                updatedCount++;
                console.log(`  Updated — Level: ${user.level}, Badges: ${user.badges.length}`);
            } else {
                console.log(`  No changes needed`);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('Migration complete!');
        console.log(`Users updated: ${updatedCount}/${users.length}`);
        console.log(`Badges awarded: ${badgesAwarded}`);
        console.log('='.repeat(60));
    } catch (error) {
        console.error('Migration error:', error);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
        console.log('DB connection closed');
    }
};

migrateGamification();
