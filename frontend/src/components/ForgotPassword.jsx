import React, { useEffect, useState } from "react";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { HideLoading, ShowLoading } from "../redux/loaderSlice";
import { forgotPassword, verifyResetOtp, resetPassword } from "../apicalls/users";

const RESEND_COOLDOWN = 30;

/**
 * Self-contained forgot-password flow: email → OTP → new password.
 * Props: onDone() (back to login), onBack().
 */
function ForgotPassword({ onDone, onBack }) {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
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
    if (!email.trim()) return message.error("Enter your registered email.");
    sendCode(email.trim());
  };

  const submitOtp = async (e) => {
    e.preventDefault();
    const code = otp.trim();
    if (code.length !== 6) return message.error("Enter the 6-digit code.");
    try {
      dispatch(ShowLoading());
      const res = await verifyResetOtp({ email, otp: code });
      dispatch(HideLoading());
      if (res.success) {
        setResetToken(res.data.resetToken);
        setStep("reset");
      } else {
        message.error(
          res.attemptsLeft !== undefined
            ? `${res.message} (${res.attemptsLeft} tries left)`
            : res.message
        );
      }
    } catch (err) {
      dispatch(HideLoading());
      message.error(err.message);
    }
  };

  const submitNewPassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      return message.error("Password must be at least 6 characters.");
    }
    if (password !== confirm) {
      return message.error("Passwords do not match.");
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
      <p className="nb-data text-xs text-soft">field log · recovery</p>
      <h2 className="font-display font-extrabold text-2xl mt-1">Reset password</h2>

      {step === "email" && (
        <>
          <p className="text-sm text-soft mt-1">
            Enter your registered email and a 6-digit code will be sent to it.
          </p>
          <form onSubmit={submitEmail} className="mt-4">
            <label htmlFor="fp-email" className="text-sm font-medium">Email</label>
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
              Send code
            </button>
          </form>
        </>
      )}

      {step === "otp" && (
        <>
          <p className="text-sm text-soft mt-1">
            Code sent to <span className="font-semibold text-ink">{email}</span>.
            It expires in 10 minutes.
          </p>
          <form onSubmit={submitOtp} className="mt-4">
            <label htmlFor="fp-otp" className="text-sm font-medium">Verification code</label>
            <input
              id="fp-otp"
              className="nb-data mt-1 text-center !text-xl !tracking-[0.4em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            />
            <button type="submit" className="nb-btn w-full mt-3">
              Verify code
            </button>
          </form>
          <div className="mt-3 text-sm text-right">
            <button
              type="button"
              onClick={() => sendCode(email)}
              disabled={cooldown > 0}
              className="text-accent font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
            >
              {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
            </button>
          </div>
        </>
      )}

      {step === "reset" && (
        <>
          <p className="text-sm text-soft mt-1">
            Code accepted. Choose a new password.
          </p>
          <form onSubmit={submitNewPassword} className="mt-4">
            <label htmlFor="fp-new" className="text-sm font-medium">New password</label>
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
              Confirm new password
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
              Set new password
            </button>
          </form>
        </>
      )}

      <button
        type="button"
        onClick={onBack}
        className="text-sm text-soft hover:text-accent mt-3"
      >
        ← Back to login
      </button>
    </div>
  );
}

export default ForgotPassword;
