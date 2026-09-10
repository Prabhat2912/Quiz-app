const router = require("express").Router()
const { addReport, getAllAttempts, getAllAttemptsByUser, getAllReports, getUserProgress, getAnyUserProgress, getLeaderboard, getBadgeCatalog, getXPHistory, getReportById } = require("../controllers/reportController")
const authMiddleware = require("../middlewares/authMiddleware")


router.post("/addReport", authMiddleware, addReport)
router.post("/getAllAttempts", authMiddleware, getAllAttempts)
router.get("/getAllAttemptsByUser", authMiddleware, getAllAttemptsByUser)
router.get("/getAllReports", authMiddleware, getAllReports)
router.get("/getUserProgress", authMiddleware, getUserProgress)
router.get("/admin/user-progress/:userId", authMiddleware, getAnyUserProgress)
router.get("/leaderboard", authMiddleware, getLeaderboard)
router.get("/badges", authMiddleware, getBadgeCatalog)
router.get("/xp-history", authMiddleware, getXPHistory)
router.get("/report/:id", authMiddleware, getReportById)


module.exports = router;