const Report = require("../models/reportModel")
const Exam = require("../models/examModel")
const User = require("../models/userModel")

// Helper function to calculate level from XP
const calculateLevel = (xp) => {
    if (xp < 100) return 1;
    if (xp < 300) return 2;
    if (xp < 600) return 3;
    if (xp < 1000) return 4;
    if (xp < 1500) return 5;
    if (xp < 2100) return 6;
    if (xp < 2800) return 7;
    if (xp < 3600) return 8;
    if (xp < 4500) return 9;
    return 10;
}

// Helper function to check and award badges
const checkAndAwardBadges = async (user, correctAnswers, totalQuestions) => {
    const newBadges = [];
    const existingBadgeNames = user.badges.map(b => b.name);

    // Learner Badge - Complete 5 quizzes
    if (user.stats.totalQuizzesCompleted >= 5 && !existingBadgeNames.includes('Learner')) {
        newBadges.push({
            name: 'Learner',
            description: 'Completed 5 quizzes',
            icon: 'ri-book-2-line',
            earnedAt: new Date()
        });
    }

    // Sharp Mind Badge - 80%+ accuracy
    const accuracy = (correctAnswers / totalQuestions) * 100;
    if (accuracy >= 80 && !existingBadgeNames.includes('Sharp Mind')) {
        newBadges.push({
            name: 'Sharp Mind',
            description: 'Scored 80% or higher',
            icon: 'ri-brain-line',
            earnedAt: new Date()
        });
    }

    // Perfect Score Badge - 100% accuracy
    if (accuracy === 100 && !existingBadgeNames.includes('Perfect Score')) {
        newBadges.push({
            name: 'Perfect Score',
            description: 'Achieved 100% in a quiz',
            icon: 'ri-trophy-line',
            earnedAt: new Date()
        });
    }

    // Dedicated Learner - Complete 20 quizzes
    if (user.stats.totalQuizzesCompleted >= 20 && !existingBadgeNames.includes('Dedicated Learner')) {
        newBadges.push({
            name: 'Dedicated Learner',
            description: 'Completed 20 quizzes',
            icon: 'ri-medal-line',
            earnedAt: new Date()
        });
    }

    // Streak Warrior - 7 day streak
    if (user.stats.currentStreak >= 7 && !existingBadgeNames.includes('Streak Warrior')) {
        newBadges.push({
            name: 'Streak Warrior',
            description: '7-day learning streak',
            icon: 'ri-fire-line',
            earnedAt: new Date()
        });
    }

    // Knowledge Master - Complete 50 quizzes
    if (user.stats.totalQuizzesCompleted >= 50 && !existingBadgeNames.includes('Knowledge Master')) {
        newBadges.push({
            name: 'Knowledge Master',
            description: 'Completed 50 quizzes',
            icon: 'ri-star-line',
            earnedAt: new Date()
        });
    }

    return newBadges;
}

//add attempts

const addReport = async (req, res) => {
    try {
        const { result, answers, exam: examId, user: userId } = req.body;

        // Calculate XP earned
        const correctAnswersCount = result.correctAnswers.length;
        const totalQuestions = result.correctAnswers.length + result.wrongAnswers.length;
        let xpEarned = correctAnswersCount * 10; // 10 XP per correct answer

        // Bonus XP for perfect score
        if (correctAnswersCount === totalQuestions) {
            xpEarned += 20; // +20 XP bonus for full score
        }

        // Create report with XP
        const report = new Report({
            ...req.body,
            xpEarned
        });
        await report.save();

        // Update user stats and XP
        const user = await User.findById(userId);
        if (user) {
            const oldLevel = user.level;

            // Update XP and level
            user.xp = (user.xp || 0) + xpEarned;
            user.level = calculateLevel(user.xp);

            // Update stats
            user.stats = user.stats || {};
            user.stats.totalQuizzesCompleted = (user.stats.totalQuizzesCompleted || 0) + 1;
            user.stats.totalCorrectAnswers = (user.stats.totalCorrectAnswers || 0) + correctAnswersCount;
            user.stats.totalQuestionsAttempted = (user.stats.totalQuestionsAttempted || 0) + totalQuestions;

            // Update streak
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const lastQuizDate = user.stats.lastQuizDate ? new Date(user.stats.lastQuizDate) : null;

            if (lastQuizDate) {
                lastQuizDate.setHours(0, 0, 0, 0);
                const daysDiff = Math.floor((today - lastQuizDate) / (1000 * 60 * 60 * 24));

                if (daysDiff === 1) {
                    user.stats.currentStreak = (user.stats.currentStreak || 0) + 1;
                } else if (daysDiff > 1) {
                    user.stats.currentStreak = 1;
                }
            } else {
                user.stats.currentStreak = 1;
            }

            user.stats.longestStreak = Math.max(
                user.stats.longestStreak || 0,
                user.stats.currentStreak || 0
            );
            user.stats.lastQuizDate = new Date();

            // Check and award badges
            const newBadges = await checkAndAwardBadges(user, correctAnswersCount, totalQuestions);
            if (newBadges.length > 0) {
                user.badges = [...(user.badges || []), ...newBadges];
            }

            await user.save();

            const leveledUp = user.level > oldLevel;

            res.send({
                message: "Attempt added successfully",
                data: {
                    report,
                    xpEarned,
                    newLevel: user.level,
                    leveledUp,
                    newBadges,
                    totalXP: user.xp
                },
                success: true
            });
        } else {
            res.send({
                message: "Attempt added successfully",
                data: { report, xpEarned },
                success: true
            });
        }
    }
    catch (error) {
        console.error('Error in addReport:', error);
        res.status(500).send({
            message: error.message || "Error adding report",
            data: null,
            success: false
        })
    }
}

// get all attempts
const getAllAttempts = async (req, res) => {
    try {
        const user_admin = await User.findOne({
            _id: req.body.userid
        }).maxTimeMS(5000) // Add timeout to user lookup

        if (user_admin.isAdmin) {
            const { examName, userName } = req.body

            // Use Promise.all to run queries in parallel for better performance
            const [exam, user] = await Promise.all([
                Exam.find({
                    name: {
                        $regex: examName,
                    },
                }).maxTimeMS(5000),
                User.find({
                    name: {
                        $regex: userName,
                    },
                }).maxTimeMS(5000)
            ]);

            const matchedExamIds = exam.map((exam) => exam._id)
            const matchedUserIds = user.map((user) => user._id)

            const reports = await Report.find({
                exam: {
                    $in: matchedExamIds,
                },
                user: {
                    $in: matchedUserIds,
                },
            })
                .populate("exam")
                .populate("user")
                .sort({ createdAt: -1 })
                .limit(100) // Limit results
                .maxTimeMS(15000) // Set max execution time

            res.send({
                message: reports.length > 0 ? "All Attempts fetched successfully." : "No Attempts to display.",
                data: reports,
                success: true
            })
        }
        else {
            res.status(403).send({
                message: "Cannot Fetch All Attempts.",
                data: null,
                success: false
            })
        }
    }
    catch (error) {
        console.error('Error in getAllAttempts:', error);
        res.status(500).send({
            message: error.message || "Error fetching attempts",
            data: null,
            success: false
        })
    }
}

const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find({})
            .populate("exam")
            .populate("user")
            .sort({ createdAt: -1 })
            .limit(100) // Limit results to prevent large responses
            .maxTimeMS(20000) // Set max execution time to 20 seconds

        res.send({
            message: reports.length > 0 ? "All Attempts fetched successfully." : "No Attempts to display.",
            data: reports,
            success: true
        })
    }
    catch (error) {
        console.error('Error in getAllReports:', error);
        res.status(500).send({
            message: error.message || "Error fetching reports",
            data: null,
            success: false
        })
    }
}


const getAllAttemptsByUser = async (req, res) => {
    try {
        // Add timeout to the query
        const reports = await Report.find({ user: req.body.userid })
            .populate("exam")
            .populate("user")
            .sort({ createdAt: -1 })
            .limit(100) // Limit results to prevent large responses
            .maxTimeMS(20000) // Set max execution time to 20 seconds

        res.send({
            message: reports.length > 0 ? "All Attempts fetched successfully." : "No Attempts to display.",
            data: reports,
            success: true
        })
    }
    catch (error) {
        console.error('Error in getAllAttemptsByUser:', error);
        res.status(500).send({
            message: error.message || "Error fetching attempts",
            data: null,
            success: false
        })
    }
}

// Get user progress and stats
const getUserProgress = async (req, res) => {
    try {
        const user = await User.findById(req.body.userid);
        if (!user) {
            return res.status(404).send({
                message: "User not found",
                success: false
            });
        }

        const reports = await Report.find({ user: req.body.userid })
            .populate("exam")
            .sort({ createdAt: -1 })
            .maxTimeMS(10000);

        // Calculate accuracy
        const accuracy = user.stats.totalQuestionsAttempted > 0
            ? ((user.stats.totalCorrectAnswers / user.stats.totalQuestionsAttempted) * 100).toFixed(2)
            : 0;

        // Get score history (last 10 attempts)
        const scoreHistory = reports.slice(0, 10).map(report => ({
            examName: report.exam.name,
            score: report.result.correctAnswers.length,
            total: report.result.correctAnswers.length + report.result.wrongAnswers.length,
            percentage: ((report.result.correctAnswers.length / (report.result.correctAnswers.length + report.result.wrongAnswers.length)) * 100).toFixed(2),
            date: report.createdAt,
            xpEarned: report.xpEarned || 0,
            verdict: report.result.verdict
        }));

        // Category-wise performance
        const categoryPerformance = {};
        reports.forEach(report => {
            const category = report.exam.category;
            if (!categoryPerformance[category]) {
                categoryPerformance[category] = {
                    attempted: 0,
                    correct: 0,
                    total: 0
                };
            }
            categoryPerformance[category].attempted += 1;
            categoryPerformance[category].correct += report.result.correctAnswers.length;
            categoryPerformance[category].total += report.result.correctAnswers.length + report.result.wrongAnswers.length;
        });

        // Calculate average score per category
        Object.keys(categoryPerformance).forEach(category => {
            const stats = categoryPerformance[category];
            stats.averageScore = stats.total > 0
                ? ((stats.correct / stats.total) * 100).toFixed(2)
                : 0;
        });

        // Calculate level progress
        const levelXPRequired = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];
        const currentLevelXP = levelXPRequired[user.level - 1] || 0;
        const nextLevelXP = levelXPRequired[user.level] || 999999;
        const xpProgress = user.xp - currentLevelXP;
        const xpNeeded = nextLevelXP - currentLevelXP;
        const progressPercentage = Math.min(((xpProgress / xpNeeded) * 100).toFixed(2), 100);

        res.send({
            message: "User progress fetched successfully",
            data: {
                user: {
                    name: user.name,
                    email: user.email,
                    level: user.level,
                    xp: user.xp,
                    badges: user.badges || [],
                    stats: user.stats
                },
                stats: {
                    totalQuizzesCompleted: user.stats?.totalQuizzesCompleted || 0,
                    accuracy: parseFloat(accuracy),
                    currentStreak: user.stats?.currentStreak || 0,
                    longestStreak: user.stats?.longestStreak || 0,
                    totalCorrectAnswers: user.stats?.totalCorrectAnswers || 0,
                    totalQuestionsAttempted: user.stats?.totalQuestionsAttempted || 0
                },
                levelProgress: {
                    currentLevel: user.level,
                    currentXP: user.xp,
                    xpForCurrentLevel: currentLevelXP,
                    xpForNextLevel: nextLevelXP,
                    xpProgress,
                    xpNeeded,
                    progressPercentage: parseFloat(progressPercentage)
                },
                recentScores: scoreHistory,
                categoryPerformance
            },
            success: true
        });
    }
    catch (error) {
        console.error('Error in getUserProgress:', error);
        res.status(500).send({
            message: error.message || "Error fetching user progress",
            data: null,
            success: false
        });
    }
}

module.exports = { addReport, getAllAttempts, getAllReports, getAllAttemptsByUser, getUserProgress }
