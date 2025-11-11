const router = require("express").Router()
const { addReport, getAllAttempts, getAllAttemptsByUser, getAllReports, getUserProgress } = require("../controllers/reportController")
const authMiddleware = require("../middlewares/authMiddleware")


router.post("/addReport", authMiddleware, addReport)
router.post("/getAllAttempts", authMiddleware, getAllAttempts)
router.get("/getAllAttemptsByUser", authMiddleware, getAllAttemptsByUser)
router.get("/getAllReports", authMiddleware, getAllReports)
router.get("/getUserProgress", authMiddleware, getUserProgress)


module.exports = router;