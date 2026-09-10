import React, { useEffect, useRef, useState } from "react";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { HideLoading, ShowLoading } from "../redux/loaderSlice";
import { forgotPassword, verifyResetOtp, resetPassword } from "../apicalls/users";

const RESEND_COOLDOWN = 30;

/**
 * Self-contained forgot-password flow: email → OTP → new password.
 * Props: onDone() (back to login), onBack().
 */
function ForgotPassword({ onDone, onBack }) {
  const { t } = useTranslation();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [cooldown, setCooldown] = useState(0);
  // After one failed attempt auto-submit stays off: retries are manual.
  const [autoLocked, setAutoLocked] = useState(false);
  const busyRef = useRef(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (cooldown <= 0) return;
    const tmr = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(tmr);
  }, [cooldown]);

  const sendCode = async (address) => {
    dispatch(ShowLoading());
    try {
      const res = await forgotPassword({ email: address });
      dispatch(HideLoading());
      if (res.success) {
        message.success(res.message);
        setStep("otp");
        setCooldown(RESEND_COOLDOWN);
        return true;
      }
      message.error(res.message);
      return false;
    } catch (err) {
      dispatch(HideLoading());
      message.error(err.message);
      return false;
    }
  };

  const submitEmail = (e) => {
    e.preventDefault();
    if (!email.trim()) return message.error(t("forgot.needEmail"));
    sendCode(email.trim());
  };

  const doVerifyOtp = async (code) => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      dispatch(ShowLoading());
      const res = await verifyResetOtp({ email, otp: code });
      dispatch(HideLoading());
      if (res.success) {
        setResetToken(res.data.resetToken);
        setStep("reset");
      } else {
        setAutoLocked(true);
        message.error(
          res.attemptsLeft !== undefined
            ? `${res.message} (${t("auth.triesLeft", { count: res.attemptsLeft })})`
            : res.message
        );
      }
    } catch (err) {
      dispatch(HideLoading());
      setAutoLocked(true);
      message.error(err.message);
    } finally {
      busyRef.current = false;
    }
  };

  const submitOtp = (e) => {
    e.preventDefault();
    const code = otp.trim();
    if (code.length !== 6) return message.error(t("forgot.needCode"));
    doVerifyOtp(code);
  };

  const handleOtpChange = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setOtp(digits);
    if (digits.length === 6 && !autoLocked) {
      doVerifyOtp(digits);
    }
  };

  const submitNewPassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      return message.error(t("forgot.shortPassword"));
    }
    if (password !== confirm) {
      return message.error(t("forgot.mismatch"));
    }
    try {
      dispatch(ShowLoading());
      const res = await resetPassword({ resetToken, newPassword: password });
      dispatch(HideLoading());
      if (res.success) {
        message.success(res.message);
        onDone();
      } else {
        message.error(res.message);
        if (/expired|again/i.test(res.message)) setStep("email");
      }
    } catch (err) {
      dispatch(HideLoading());
      message.error(err.message);
    }
  };

  return (
    <div>
      <p className="nb-data text-xs text-soft">{t("forgot.kicker")}</p>
      <h2 className="font-display font-extrabold text-2xl mt-1">{t("forgot.title")}</h2>

      {step === "email" && (
        <>
          <p className="text-sm text-soft mt-1">
            {t("forgot.emailSub")}
          </p>
          <form onSubmit={submitEmail} className="mt-4">
            <label htmlFor="fp-email" className="text-sm font-medium">{t("forgot.emailLabel")}</label>
            <input
              id="fp-email"
              type="email"
              className="mt-1"
              placeholder="you@lab.example"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="nb-btn w-full mt-3">
              {t("forgot.sendCode")}
            </button>
          </form>
        </>
      )}

      {step === "otp" && (
        <>
          <p className="text-sm text-soft mt-1">
            {t("forgot.otpSub", { email })}
          </p>
          <form onSubmit={submitOtp} className="mt-4">
            <label htmlFor="fp-otp" className="text-sm font-medium">{t("forgot.codeLabel")}</label>
            <input
              id="fp-otp"
              className="nb-data mt-1 text-center text-xl! tracking-[0.4em]!"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={(e) => handleOtpChange(e.target.value)}
            />
            <button type="submit" className="nb-btn w-full mt-3">
              {t("forgot.verifyCode")}
            </button>
          </form>
          <div className="mt-3 text-sm text-right">
            <button
              type="button"
              onClick={() => sendCode(email)}
              disabled={cooldown > 0}
              className="text-accent font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {cooldown > 0 ? t("forgot.resendIn", { n: cooldown }) : t("forgot.resend")}
            </button>
          </div>
        </>
      )}

      {step === "reset" && (
        <>
          <p className="text-sm text-soft mt-1">
            {t("forgot.resetSub")}
          </p>
          <form onSubmit={submitNewPassword} className="mt-4">
            <label htmlFor="fp-new" className="text-sm font-medium">{t("forgot.newPassword")}</label>
            <input
              id="fp-new"
              type="password"
              className="mt-1"
              placeholder="••••••••"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="fp-confirm" className="text-sm font-medium mt-3 block">
              {t("forgot.confirmNew")}
            </label>
            <input
              id="fp-confirm"
              type="password"
              className="mt-1"
              placeholder="••••••••"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button type="submit" className="nb-btn w-full mt-3">
              {t("forgot.setPassword")}
            </button>
          </form>
        </>
      )}

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-soft hover:text-accent mt-3"
      >
        {t("forgot.backToLogin")}
      </button>
    </div>
  );
}

export default ForgotPassword;
