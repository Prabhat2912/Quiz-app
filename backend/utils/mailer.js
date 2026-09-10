const nodemailer = require("nodemailer")

// Accepts generic SMTP_* vars, falling back to the legacy EMAIL_USER/EMAIL_PASS
// pair (Gmail). When nothing is configured we log the code so local dev can
// still complete the flow, and report sent:false to the caller.
function smtpConfigured() {
    return !!(
        (process.env.SMTP_USER || process.env.EMAIL_USER) &&
        (process.env.SMTP_PASS || process.env.EMAIL_PASS)
    )
}

let transporter = null
function getTransporter() {
    if (transporter) return transporter
    const host = process.env.SMTP_HOST || "smtp.gmail.com"
    const port = parseInt(process.env.SMTP_PORT || "587", 10)
    const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true"
    transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: {
            user: process.env.SMTP_USER || process.env.EMAIL_USER,
            pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
        },
    })
    return transporter
}

async function sendOtpEmail(to, otp, purpose) {
    if (!smtpConfigured()) {
        console.log(`[OTP:${purpose}] email not configured — code for ${to}: ${otp}`)
        return { sent: false }
    }
    const addr = process.env.MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;
    // Force the app name as the display name so inboxes show
    // "Quiz App" instead of the raw account username.
    const from = /<[^>]+>/.test(addr) ? addr : `"Quiz App" <${addr}>`;
    const isReset = purpose === "reset"
    const action = isReset ? "reset your password" : "verify your email address"
    const kicker = isReset ? "field log · recovery" : "field log · ownership check"
    const info = await getTransporter().sendMail({
        from,
        to,
        subject: isReset ? "Reset your Quiz App password" : "Verify your Quiz App email",
        text: `Your Quiz App verification code is ${otp}. It expires in 10 minutes. Use it to ${action}. If you did not request this, ignore this email.`,
        html: `<div style="margin:0;padding:24px;background:#F4F5F1;font-family:Arial,Helvetica,sans-serif">`
            + `<div style="max-width:480px;margin:0 auto;padding:28px;background:#FCFCF9;border:1px solid #DFE4DC;border-radius:10px">`
            + `<p style="margin:0;font-family:monospace;font-size:12px;color:#5F6E64">${kicker}</p>`
            + `<h2 style="margin:8px 0 0;font-size:22px;color:#17211B">Quiz App</h2>`
            + `<p style="color:#17211B;font-size:14px">Use this code to ${action}. It expires in <b>10 minutes</b>.</p>`
            + `<p style="font-family:monospace;font-size:32px;font-weight:800;letter-spacing:8px;margin:20px 0;color:#0B6B4F">${otp}</p>`
            + `<div style="border-top:1px solid #DFE4DC;padding-top:12px">`
            + `<p style="color:#5F6E64;font-size:12px;margin:0">Run quizzes like experiments · 100 levels · 17 specimens</p>`
            + `<p style="color:#5F6E64;font-size:12px;margin:4px 0 0">If you did not request this, you can safely ignore this email.</p>`
            + `</div></div></div>`,
    })
    console.log(`[mail] accepted by Gmail for ${to} (id: ${info.messageId}) — if it never lands, check spam.`)
    return { sent: true }
}

module.exports = { sendOtpEmail, smtpConfigured, verifyMailTransport }

// Checks the SMTP login at boot and logs one unmistakable line so a bad
// app password (the usual Gmail failure) is visible immediately.
async function verifyMailTransport() {
    if (!smtpConfigured()) {
        console.log("[mail] delivery NOT configured — OTP codes will only print to this console.")
        return { ok: false, reason: "not-configured" }
    }
    try {
        await getTransporter().verify()
        console.log("[mail] delivery ready — OTP emails will send.")
        return { ok: true }
    } catch (error) {
        console.error(`[mail] delivery FAILED: ${error.message}`)
        console.error("[mail] Gmail fix: use an App Password (Google Account → Security → 2-Step Verification → App passwords), not your login password.")
        return { ok: false, reason: error.message }
    }
}
