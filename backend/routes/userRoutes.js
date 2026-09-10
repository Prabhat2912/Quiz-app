const router = require("express").Router()
const { register, login, getUserInfo, sendVerificationOtp, verifyEmail, forgotPassword, verifyResetOtp, resetPassword } = require("../controllers/userControllers")
const authMiddleware = require("../middlewares/authMiddleware")

router.post('/register', register)
router.post('/login', login)
router.post('/get-user-info', authMiddleware, getUserInfo)
router.post('/send-verification-otp', sendVerificationOtp)
router.post('/verify-email', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/verify-reset-otp', verifyResetOtp)
router.post('/reset-password', resetPassword)


module.exports = router
