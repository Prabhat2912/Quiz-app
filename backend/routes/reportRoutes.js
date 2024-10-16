const router = require("express").Router()
const { addReport, getAllAttempts, getAllAttemptsByUser, getAllReports } = require("../controllers/reportController")
const authMiddleware = require("../middlewares/authMiddleware")


router.post("/addReport", authMiddleware, addReport)
router.post("/getAllAttempts", authMiddleware, getAllAttempts)
router.get("/getAllAttemptsByUser", authMiddleware, getAllAttemptsByUser)
router.get("/getAllReports", authMiddleware, getAllReports)


module.exports = router;