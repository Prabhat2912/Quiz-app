import React, { useState } from "react";
import { Form, message } from "antd";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginUser, registerUser } from "../../../apicalls/users";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { useTranslation } from "react-i18next";
import VerifyEmailOtp from "../../../components/VerifyEmailOtp";
import ForgotPassword from "../../../components/ForgotPassword";

/**
 * Sliding auth: login lives left, register lives right, one overlay
 * glides between them. Both /login and /register render this page so
 * switching routes animates instead of remounting.
 */
function AuthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const mode = location.pathname.startsWith("/register") ? "register" : "login";
  const go = (next) => navigate(next === "register" ? "/register" : "/login");
  // Left panel sub-views: plain login | forgot-password flow | email OTP check.
  const [leftView, setLeftView] = useState({ name: "login" });
  // Registration awaiting verification (kept in memory only, cleared after use).
  const [pendingReg, setPendingReg] = useState(null);
  // Last blocked-login attempt, for auto sign-in after verification.
  const [lastAttempt, setLastAttempt] = useState(null);

  const onLogin = async (values) => {
    try {
      dispatch(ShowLoading());
      const response = await loginUser(values);
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        localStorage.setItem("token", response.data);
        window.location.href = "/";
      } else if (response.needsVerification && response.email) {
        setLastAttempt({ email: response.email, password: values.password });
        setLeftView({ name: "verify", email: response.email });
        message.info(response.message);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const onRegister = async (values) => {
    if (values.password !== values.confirmPassword) {
      return message.error(t("auth.passwordMismatch"));
    }
    try {
      dispatch(ShowLoading());
      const response = await registerUser(values);
      dispatch(HideLoading());
      if (response.success && response.needsVerification) {
        message.success(response.message);
        setPendingReg({ email: response.email, password: values.password });
      } else if (response.success) {
        message.success(response.message);
        go("login");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  return (
    <div className="nb-page min-h-screen flex p-4 pt-16 sm:p-8 relative">
      <Link
        to="/"
        className="nb-btn-ghost py-2! px-3! text-sm absolute top-4 left-4 z-10"
      >
        <i className="ri-home-line mr-1" aria-hidden="true"></i>
        {t("auth.home")}
      </Link>
      <div className="nb-sheet w-full max-w-4xl m-auto overflow-hidden">
        <div className="grid md:grid-cols-2 relative items-stretch">
          {/* Left — login / recovery / verification */}
          <section
            aria-label={t("auth.loginBtn")}
            aria-hidden={mode !== "login"}
            inert={mode !== "login" ? true : undefined}
            className={`p-6 sm:p-10 flex flex-col justify-center ${
              mode !== "login" ? "hidden md:flex" : ""
            }`}
          >
            {leftView.name === "forgot" ? (
              <ForgotPassword
                onDone={() => setLeftView({ name: "login" })}
                onBack={() => setLeftView({ name: "login" })}
              />
            ) : leftView.name === "verify" ? (
              <VerifyEmailOtp
                email={leftView.email}
                onVerified={async () => {
                  const creds = lastAttempt;
                  setLastAttempt(null);
                  setLeftView({ name: "login" });
                  if (creds?.password) {
                    await onLogin({ email: creds.email, password: creds.password });
                  }
                }}
                onBack={() => setLeftView({ name: "login" })}
              />
            ) : (
            <>
            <p className="nb-data text-xs text-soft">{t("auth.loginEntry")}</p>
            <h2 className="font-display font-extrabold text-2xl mt-1">
              {t("auth.welcomeBack")}
            </h2>
            <p className="text-sm text-soft mt-1">
              {t("auth.loginSub")}
            </p>
            <Form layout="vertical" className="mt-4" onFinish={onLogin}>
              <Form.Item
                name="email"
                label={t("auth.email")}
                rules={[{ required: true, message: t("auth.needEmail") }]}
              >
                <input type="email" placeholder="you@lab.example" autoComplete="email" />
              </Form.Item>
              <Form.Item
                name="password"
                label={t("auth.password")}
                rules={[{ required: true, message: t("auth.needPassword") }]}
              >
                <input type="password" placeholder="••••••••" autoComplete="current-password" />
              </Form.Item>
              <button type="submit" className="nb-btn w-full mt-2">
                {t("auth.loginBtn")}
              </button>
            </Form>
            <button
              type="button"
              onClick={() => setLeftView({ name: "forgot" })}
              className="text-sm text-accent font-semibold hover:underline mt-3"
            >
              {t("auth.forgot")}
            </button>
            <p className="text-sm mt-4 text-center md:hidden">
              <span className="text-soft">{t("auth.toRegister")} </span>
              <button
                type="button"
                onClick={() => go("register")}
                className="text-accent font-semibold hover:underline"
              >
                {t("auth.toRegisterLink")}
              </button>
            </p>
            </>
            )}
          </section>

          {/* Right — register / verification */}
          <section
            aria-label={t("auth.registerBtn")}
            aria-hidden={mode !== "register"}
            inert={mode !== "register" ? true : undefined}
            className={`p-6 sm:p-10 flex flex-col justify-center ${
              mode !== "register" ? "hidden md:flex" : ""
            }`}
          >
            {pendingReg ? (
              <VerifyEmailOtp
                email={pendingReg.email}
                onVerified={async () => {
                  const creds = pendingReg;
                  setPendingReg(null);
                  if (creds?.password) {
                    await onLogin({ email: creds.email, password: creds.password });
                  } else {
                    go("login");
                  }
                }}
                onBack={() => setPendingReg(null)}
              />
            ) : (
            <>
            <p className="nb-data text-xs text-soft">{t("auth.registerEntry")}</p>
            <h2 className="font-display font-extrabold text-2xl mt-1">
              {t("auth.openPage")}
            </h2>
            <p className="text-sm text-soft mt-1">
              {t("auth.registerSub")}
            </p>
            <Form
              layout="vertical"
              className="mt-4"
              onFinish={onRegister}
              initialValues={{ isAdmin: false }}
            >
              <Form.Item
                name="name"
                label={t("auth.name")}
                rules={[{ required: true, message: t("auth.needName") }]}
              >
                <input type="text" placeholder="Ada Lovelace" autoComplete="name" />
              </Form.Item>
              <Form.Item
                name="email"
                label={t("auth.email")}
                rules={[{ required: true, message: t("auth.needEmail") }]}
              >
                <input type="email" placeholder="you@lab.example" autoComplete="email" />
              </Form.Item>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
                <Form.Item
                  name="password"
                  label={t("auth.password")}
                  rules={[{ required: true, message: t("auth.needPassword") }]}
                >
                  <input type="password" placeholder="••••••••" autoComplete="new-password" />
                </Form.Item>
                <Form.Item
                  name="confirmPassword"
                  label={t("auth.confirmPassword")}
                  rules={[{ required: true, message: t("auth.needConfirm") }]}
                >
                  <input type="password" placeholder="••••••••" autoComplete="new-password" />
                </Form.Item>
              </div>
              <Form.Item
                name="isAdmin"
                label={t("auth.registerAs")}
                rules={[{ required: true, message: t("auth.needRole") }]}
              >
                <select>
                  <option value={false}>{t("auth.roleLearner")}</option>
                  <option value={true}>{t("auth.roleAuthor")}</option>
                </select>
              </Form.Item>
              <button type="submit" className="nb-btn w-full mt-2">
                {t("auth.registerBtn")}
              </button>
            </Form>
            <p className="text-sm mt-4 text-center md:hidden">
              <span className="text-soft">{t("auth.toLogin")} </span>
              <button
                type="button"
                onClick={() => go("login")}
                className="text-accent font-semibold hover:underline"
              >
                {t("auth.toLoginLink")}
              </button>
            </p>
            </>
            )}
          </section>

          {/* Sliding cover */}
          <div
            aria-hidden="true"
            className="nb-auth-overlay hidden md:flex flex-col justify-center px-10 absolute top-0 bottom-0 left-0 w-1/2 bg-accent text-white dark:text-[#06231a]"
            style={{
              transform:
                mode === "register" ? "translateX(0)" : "translateX(100%)",
            }}
          >
            <div className="relative flex-1 flex flex-col justify-center">
              <div
                className={`nb-auth-face absolute inset-0 flex flex-col justify-center ${
                  mode === "login"
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <p className="nb-data text-xs opacity-70">{t("common.appName")} · {t("landing.tagline")}</p>
                <h2 className="font-display font-extrabold text-3xl mt-2 text-inherit!">
                  {t("auth.overlayNew")}
                </h2>
                <p className="text-sm mt-2 opacity-80">
                  {t("auth.overlayNewText")}
                </p>
                <button
                  type="button"
                  tabIndex={mode === "login" ? 0 : -1}
                  onClick={() => go("register")}
                  className="nb-btn-inverse mt-5 self-start"
                >
                  {t("auth.overlayRegister")}
                </button>
              </div>
              <div
                className={`nb-auth-face absolute inset-0 flex flex-col justify-center ${
                  mode === "register"
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                }`}
              >
                <p className="nb-data text-xs opacity-70">{t("common.appName")} · {t("landing.tagline")}</p>
                <h2 className="font-display font-extrabold text-3xl mt-2 text-inherit!">
                  {t("auth.overlayHave")}
                </h2>
                <p className="text-sm mt-2 opacity-80">
                  {t("auth.overlayHaveText")}
                </p>
                <button
                  type="button"
                  tabIndex={mode === "register" ? 0 : -1}
                  onClick={() => go("login")}
                  className="nb-btn-inverse mt-5 self-start"
                >
                  {t("auth.overlayLogin")}
                </button>
              </div>
            </div>
            <p className="nb-data text-xs opacity-60 pb-6">
              100 levels · 17 specimens · +10 XP per correct
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage;
