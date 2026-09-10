const Report = require("../models/reportModel")
const Exam = require("../models/examModel")
const User = require("../models/userModel")
const {
    calculateLevel,
    getXPForLevel,
    getLevelProgress,
    calculateXP,
    checkBadgesToAward,
    getNextLevelBadge,
    ALL_BADGES,
    LEVEL_BADGES,
} = require("../config/gamification")

// Re-export helpers for scripts/tests (keeps old imports working)
module.exports.calculateLevel = calculateLevel;
module.exports.getXPForLevel = getXPForLevel;

// Compute streak after this quiz (call BEFORE saving so bonus uses new streak)
function computeStreakAfter(user) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const lastQuizDate = user.stats?.lastQuizDate ? new Date(user.stats.lastQuizDate) : null;

    let streak = user.stats?.currentStreak || 0;
    if (lastQuizDate) {
        lastQuizDate.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today - lastQuizDate) / (1000 * 60 * 60 * 24));
        if (daysDiff === 0) {
            // Same day — keep streak (don't double-increment)
            streak = streak || 1;
        } else if (daysDiff === 1) {
            streak = streak + 1;
        } else {
            streak = 1;
        }
    } else {
        streak = 1;
    }
    return streak;
}

//add attempts
const addReport = async (req, res) => {
    try {
        const { result, answers, exam: examId, user: userId } = req.body;

        if (!result || !examId || !userId) {
            return res.status(400).send({
                message: "Missing required fields: result, exam, user",
                success: false
            });
        }

        const correctAnswersCount = result.correctAnswers?.length || 0;
        const wrongCount = result.wrongAnswers?.length || 0;
        const totalQuestions = correctAnswersCount + wrongCount;
        const verdict = result.verdict || "Fail";

        // Load user first so streak bonus uses the updated streak
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ message: "User not found", success: false });
        }

        // Ensure gamification fields exist (backward compat for old users)
        user.xp = user.xp || 0;
        user.level = user.level || 1;
        user.badges = user.badges || [];
        user.stats = user.stats || {};
        user.stats.totalQuizzesCompleted = user.stats.totalQuizzesCompleted || 0;
        user.stats.totalCorrectAnswers = user.stats.totalCorrectAnswers || 0;
        user.stats.totalQuestionsAttempted = user.stats.totalQuestionsAttempted || 0;
        user.stats.perfectScores = user.stats.perfectScores || 0;
        user.stats.passedQuizzes = user.stats.passedQuizzes || 0;
        user.stats.currentStreak = user.stats.currentStreak || 0;
        user.stats.longestStreak = user.stats.longestStreak || 0;

        const oldLevel = user.level;
        const oldXP = user.xp;

        // Streak first (bonus depends on it)
        const streakAfter = computeStreakAfter(user);

        // Centralized XP calc
        const { xpEarned, accuracy, isPerfect, isPass, bonuses } = calculateXP({
            correctCount: correctAnswersCount,
            totalQuestions,
            verdict,
            streakAfter,
        });

        // Create report with XP + accuracy snapshot
        const report = new Report({ ...req.body, xpEarned });
        await report.save();

        // Update XP / level
        user.xp = oldXP + xpEarned;
        user.level = calculateLevel(user.xp);

        // Update stats
        user.stats.totalQuizzesCompleted += 1;
        user.stats.totalCorrectAnswers += correctAnswersCount;
        user.stats.totalQuestionsAttempted += totalQuestions;
        if (isPerfect) user.stats.perfectScores += 1;
        if (isPass) user.stats.passedQuizzes += 1;
        user.stats.currentStreak = streakAfter;
        user.stats.longestStreak = Math.max(user.stats.longestStreak, streakAfter);
        user.stats.lastQuizDate = new Date();

        // Award badges (levels + achievements) — single source of truth
        const newBadges = checkBadgesToAward(user, accuracy);
        if (newBadges.length > 0) {
            user.badges = [...user.badges, ...newBadges];
        }

        await user.save();

        const leveledUp = user.level > oldLevel;
        const levelProgress = getLevelProgress(user.xp, user.level);
        const nextBadge = getNextLevelBadge(user.level);

        res.send({
            message: "Attempt added successfully",
            data: {
                report,
                xpEarned,
                xpBreakdown: {
                    perCorrect: correctAnswersCount * 10,
                    ...bonuses,
                    accuracy: parseFloat(accuracy.toFixed(2)),
                },
                totalXP: user.xp,
                oldLevel,
                newLevel: user.level,
                leveledUp,
                levelsGained: user.level - oldLevel,
                newBadges,
                levelProgress,
                nextBadge,
            },
            success: true
        });
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

// Shared progress payload builder (powers self view + admin inspection)
const buildProgressPayload = async (targetUserId) => {
        const user = await User.findById(targetUserId);
        if (!user) {
            const err = new Error("User not found");
            err.code = "USER_NOT_FOUND";
            throw err;
        }

        const reports = await Report.find({ user: targetUserId })
            .populate("exam")
            .sort({ createdAt: -1 })
            .maxTimeMS(10000);

        const totalAttempted = user.stats?.totalQuestionsAttempted || 0;
        const totalCorrect = user.stats?.totalCorrectAnswers || 0;
        // Calculate accuracy
        const accuracy = totalAttempted > 0
            ? ((totalCorrect / totalAttempted) * 100).toFixed(2)
            : 0;

        // Get score history (last 10 attempts) — null-safe if exam was deleted
        const scoreHistory = reports.slice(0, 10).map(report => {
            const correct = report.result?.correctAnswers?.length || 0;
            const wrong = report.result?.wrongAnswers?.length || 0;
            const total = correct + wrong;
            return {
                examName: report.exam?.name || "Deleted Exam",
                category: report.exam?.category || "Unknown",
                score: correct,
                total,
                percentage: total > 0 ? parseFloat(((correct / total) * 100).toFixed(2)) : 0,
                date: report.createdAt,
                xpEarned: report.xpEarned || 0,
                verdict: report.result?.verdict || "—"
            };
        });

        // XP history (last 20) for charts
        const xpHistory = reports.slice(0, 20).reverse().map((report, idx) => ({
            label: report.exam?.name || `Quiz ${idx + 1}`,
            xp: report.xpEarned || 0,
            date: report.createdAt,
        }));
        const totalXPFromHistory = xpHistory.reduce((s, h) => s + h.xp, 0);

        // Category-wise performance — null-safe
        const categoryPerformance = {};
        reports.forEach(report => {
            const category = report.exam?.category || "Unknown";
            if (!categoryPerformance[category]) {
                categoryPerformance[category] = {
                    attempted: 0,
                    correct: 0,
                    total: 0
                };
            }
            const correct = report.result?.correctAnswers?.length || 0;
            const wrong = report.result?.wrongAnswers?.length || 0;
            categoryPerformance[category].attempted += 1;
            categoryPerformance[category].correct += correct;
            categoryPerformance[category].total += correct + wrong;
        });

        // Calculate average score per category
        Object.keys(categoryPerformance).forEach(category => {
            const stats = categoryPerformance[category];
            stats.averageScore = stats.total > 0
                ? parseFloat(((stats.correct / stats.total) * 100).toFixed(2))
                : 0;
        });

        // Centralized level progress (fixes old manual calc)
        const xp = user.xp || 0;
        const level = user.level || calculateLevel(xp);
        const levelProgress = getLevelProgress(xp, level);
        const nextBadge = getNextLevelBadge(level);

        // Full badge catalog with earned flags — frontend can render locked/unlocked
        const earnedNames = new Set((user.badges || []).map((b) => b.name));
        const badgeCatalog = ALL_BADGES.map((b) => {
            const earned = (user.badges || []).find((ub) => ub.name === b.name);
            return {
                ...b,
                earned: !!earned,
                earnedAt: earned?.earnedAt || null,
            };
        });
        const levelBadges = badgeCatalog.filter((b) => LEVEL_BADGES.some((lb) => lb.name === b.name));
        const achievementBadges = badgeCatalog.filter((b) => !LEVEL_BADGES.some((lb) => lb.name === b.name));

        return {
                user: {
                    name: user.name,
                    email: user.email,
                    level,
                    xp,
                    badges: user.badges || [],
                    stats: {
                        totalQuizzesCompleted: user.stats?.totalQuizzesCompleted || 0,
                        totalCorrectAnswers: totalCorrect,
                        totalQuestionsAttempted: totalAttempted,
                        perfectScores: user.stats?.perfectScores || 0,
                        passedQuizzes: user.stats?.passedQuizzes || 0,
                        currentStreak: user.stats?.currentStreak || 0,
                        longestStreak: user.stats?.longestStreak || 0,
                        lastQuizDate: user.stats?.lastQuizDate || null,
                    },
                },
                stats: {
                    totalQuizzesCompleted: user.stats?.totalQuizzesCompleted || 0,
                    accuracy: parseFloat(accuracy),
                    currentStreak: user.stats?.currentStreak || 0,
                    longestStreak: user.stats?.longestStreak || 0,
                    totalCorrectAnswers: totalCorrect,
                    totalQuestionsAttempted: totalAttempted,
                    perfectScores: user.stats?.perfectScores || 0,
                    passedQuizzes: user.stats?.passedQuizzes || 0,
                },
                levelProgress: {
                    currentLevel: levelProgress.currentLevel,
                    currentXP: levelProgress.currentXP,
                    xpForCurrentLevel: levelProgress.xpForCurrentLevel,
                    xpForNextLevel: levelProgress.xpForNextLevel,
                    xpProgress: levelProgress.xpProgress,
                    xpNeeded: levelProgress.xpNeeded,
                    progressPercentage: levelProgress.progressPercentage,
                    isMaxLevel: levelProgress.isMaxLevel,
                },
                nextBadge,
                badgeCatalog,
                levelBadges,
                achievementBadges,
                recentScores: scoreHistory,
                xpHistory,
                totalXPFromHistory,
                categoryPerformance
        };
}

// Get own progress and stats
const getUserProgress = async (req, res) => {
    try {
        const data = await buildProgressPayload(req.body.userid);
        res.send({
            message: "User progress fetched successfully",
            data,
            success: true
        });
    }
    catch (error) {
        console.error('Error in getUserProgress:', error);
        const status = error.code === "USER_NOT_FOUND" ? 404 : 500;
        res.status(status).send({
            message: error.message || "Error fetching user progress",
            data: null,
            success: false
        });
    }
}

// Admin-only: inspect any learner's profile + logbook (from leaderboard name click)
const getAnyUserProgress = async (req, res) => {
    try {
        const requester = await User.findById(req.body.userid).maxTimeMS(5000);
        if (!requester?.isAdmin) {
            return res.status(403).send({
                message: "Admin access required.",
                data: null,
                success: false
            });
        }
        const data = await buildProgressPayload(req.params.userId);
        res.send({
            message: "User progress fetched successfully",
            data,
            success: true
        });
    }
    catch (error) {
        console.error('Error in getAnyUserProgress:', error);
        const status = error.code === "USER_NOT_FOUND" ? 404 : 500;
        res.status(status).send({
            message: error.message || "Error fetching user progress",
            data: null,
            success: false
        });
    }
}

// GET /api/reports/leaderboard — ranked by XP (fast, no report aggregation)
const getLeaderboard = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || "50", 10), 100);
        const users = await User.find({ isAdmin: { $ne: true } })
            .select("name level xp badges stats")
            .sort({ xp: -1, level: -1 })
            .limit(limit)
            .maxTimeMS(10000);

        const leaderboard = users.map((u, idx) => {
            const attempted = u.stats?.totalQuestionsAttempted || 0;
            const correct = u.stats?.totalCorrectAnswers || 0;
            return {
                rank: idx + 1,
                userId: u._id,
                name: u.name,
                level: u.level || 1,
                xp: u.xp || 0,
                badgesCount: (u.badges || []).length,
                badges: (u.badges || []).map((b) => ({ name: b.name, icon: b.icon })),
                totalQuizzes: u.stats?.totalQuizzesCompleted || 0,
                accuracy: attempted > 0 ? parseFloat(((correct / attempted) * 100).toFixed(1)) : 0,
                currentStreak: u.stats?.currentStreak || 0,
                isCurrentUser: String(u._id) === String(req.body.userid),
            };
        });

        const myRank = leaderboard.find((e) => e.isCurrentUser)?.rank || null;

        res.send({
            message: "Leaderboard fetched successfully",
            data: { leaderboard, myRank, total: leaderboard.length },
            success: true,
        });
    } catch (error) {
        console.error("Error in getLeaderboard:", error);
        res.status(500).send({ message: error.message || "Error fetching leaderboard", success: false });
    }
};

// GET /api/reports/badges — full catalog + earned state for current user
const getBadgeCatalog = async (req, res) => {
    try {
        const user = await User.findById(req.body.userid).select("badges level xp");
        if (!user) return res.status(404).send({ message: "User not found", success: false });
        const earnedMap = new Map((user.badges || []).map((b) => [b.name, b]));
        const catalog = ALL_BADGES.map((b) => ({
            ...b,
            earned: earnedMap.has(b.name),
            earnedAt: earnedMap.get(b.name)?.earnedAt || null,
        }));
        res.send({
            message: "Badge catalog fetched successfully",
            data: {
                catalog,
                earnedCount: (user.badges || []).length,
                totalCount: ALL_BADGES.length,
                nextBadge: getNextLevelBadge(user.level || 1),
            },
            success: true,
        });
    } catch (error) {
        console.error("Error in getBadgeCatalog:", error);
        res.status(500).send({ message: error.message || "Error fetching badges", success: false });
    }
};

// GET /api/reports/xp-history — per-quiz XP for charts
const getXPHistory = async (req, res) => {
    try {
        const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
        const reports = await Report.find({ user: req.body.userid })
            .populate("exam", "name category")
            .sort({ createdAt: -1 })
            .limit(limit)
            .maxTimeMS(10000);
        const history = reports.reverse().map((r) => ({
            date: r.createdAt,
            examName: r.exam?.name || "Deleted Exam",
            xp: r.xpEarned || 0,
        }));
        res.send({
            message: "XP history fetched successfully",
            data: { history, total: history.reduce((s, h) => s + h.xp, 0) },
            success: true,
        });
    } catch (error) {
        console.error("Error in getXPHistory:", error);
        res.status(500).send({ message: error.message || "Error fetching XP history", success: false });
    }
};

// GET /api/reports/report/:id — single attempt for review (owner or admin)
const getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id)
            .populate("exam", "name category totalMarks passingMarks")
            .maxTimeMS(10000);
        if (!report) {
            return res.status(404).send({ message: "Attempt not found.", success: false });
        }
        const requester = await User.findById(req.body.userid).select("isAdmin").maxTimeMS(5000);
        if (String(report.user) !== String(req.body.userid) && !requester?.isAdmin) {
            return res.status(403).send({ message: "Admin access required.", success: false });
        }
        res.send({
            message: "Attempt fetched successfully",
            data: report,
            success: true,
        });
    } catch (error) {
        console.error("Error in getReportById:", error);
        res.status(500).send({ message: error.message || "Error fetching attempt", success: false });
    }
};

module.exports = { addReport, getAllAttempts, getAllReports, getAllAttemptsByUser, getUserProgress, getAnyUserProgress, getLeaderboard, getBadgeCatalog, getXPHistory, getReportById }
