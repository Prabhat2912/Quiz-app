import React, { useEffect, useRef, useState } from "react";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { HideLoading, ShowLoading } from "../redux/loaderSlice";
import { sendVerificationOtp, verifyEmail } from "../apicalls/users";

const RESEND_COOLDOWN = 30;

/**
 * Email-ownership check shared by registration and blocked-login flows.
 * Props: email, onVerified(), onBack().
 */
function VerifyEmailOtp({ email, onVerified, onBack }) {
  const { t } = useTranslation();
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  // After one failed attempt auto-submit stays off: retries are manual.
  const [autoLocked, setAutoLocked] = useState(false);
  const busyRef = useRef(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (cooldown <= 0) return;
    const tmr = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(tmr);
  }, [cooldown]);

  const doSubmit = async (code) => {
    if (busyRef.current) return;
    busyRef.current = true;
    try {
      dispatch(ShowLoading());
      const res = await verifyEmail({ email, otp: code });
      dispatch(HideLoading());
      if (res.success) {
        message.success(res.message);
        onVerified();
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

  const submit = (e) => {
    e.preventDefault();
    const code = otp.trim();
    if (code.length !== 6) {
      return message.error(t("verify.needCode"));
    }
    doSubmit(code);
  };

  const handleChange = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setOtp(digits);
    if (digits.length === 6 && !autoLocked) {
      doSubmit(digits);
    }
  };

  const resend = async () => {
    try {
      dispatch(ShowLoading());
      const res = await sendVerificationOtp({ email });
      dispatch(HideLoading());
      if (res.success) {
        message.success(res.message);
        setCooldown(RESEND_COOLDOWN);
      } else {
        message.error(res.message);
      }
    } catch (err) {
      dispatch(HideLoading());
      message.error(err.message);
    }
  };

  return (
    <div>
      <p className="nb-data text-xs text-soft">{t("verify.kicker")}</p>
      <h2 className="font-display font-extrabold text-2xl mt-1">{t("verify.title")}</h2>
      <p className="text-sm text-soft mt-1">
        {t("verify.sub", { email })}
      </p>
      <form onSubmit={submit} className="mt-4">
        <label htmlFor="verify-otp" className="text-sm font-medium">
          {t("verify.codeLabel")}
        </label>
        <input
          id="verify-otp"
          className="nb-data mt-1 text-center text-xl! tracking-[0.4em]!"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          value={otp}
          onChange={(e) => handleChange(e.target.value)}
        />
        <button type="submit" className="nb-btn w-full mt-3">
          {t("verify.submit")}
        </button>
      </form>
      <div className="flex items-center justify-between mt-3 text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-soft hover:text-accent"
        >
          {t("verify.back")}
        </button>
        <button
          type="button"
          onClick={resend}
          disabled={cooldown > 0}
          className="text-accent font-semibold hover:underline disabled:opacity-50 disabled:no-underline"
        >
          {cooldown > 0 ? t("verify.resendIn", { n: cooldown }) : t("verify.resend")}
        </button>
      </div>
    </div>
  );
}

export default VerifyEmailOtp;
