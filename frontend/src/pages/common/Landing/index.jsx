import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ThemeBtn from "../../../components/ThemeBtn";
import LangSwitch from "../../../components/LangSwitch";

function LandingPage() {
  const { t } = useTranslation();
  return (
    <div className="nb-page min-h-screen text-ink">
      <header className="bg-sheet border-b border-rule">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <span className="flex items-baseline gap-2">
            <span className="font-display font-extrabold text-lg tracking-tight">
              {t("common.appName")}
            </span>
            <span className="nb-data hidden sm:inline text-xs text-soft">
              {t("landing.tagline")}
            </span>
          </span>
          <nav className="flex items-center gap-2" aria-label={t("common.account")}>
            <Link to="/login" className="nb-btn-ghost py-2! px-4! text-sm">
              {t("landing.login")}
            </Link>
            <Link to="/register" className="nb-btn py-2! px-4! text-sm">
              {t("landing.register")}
            </Link>
            <LangSwitch compact />
            <ThemeBtn />
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center pt-12 sm:pt-16">
          <div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-[1.05]">
              {t("landing.heroTitle")}
            </h1>
            <p className="text-soft mt-4 text-lg max-w-xl">
              {t("landing.heroSub")}
            </p>
            <div className="flex flex-wrap gap-2 mt-6">
              <Link to="/register" className="nb-btn">
                {t("landing.ctaStart")}
              </Link>
              <Link to="/login" className="nb-btn-ghost">
                {t("landing.ctaSignin")}
              </Link>
            </div>
            <dl className="nb-data flex flex-wrap gap-x-6 gap-y-1 text-sm mt-6">
              <div>
                <dt className="sr-only">{t("landing.statLevels")}</dt>
                <dd>
                  <span className="font-bold text-lg">100</span>{" "}
                  <span className="text-soft">{t("landing.statLevels")}</span>
                </dd>
              </div>
              <div>
                <dt className="sr-only">{t("landing.statSpecimens")}</dt>
                <dd>
                  <span className="font-bold text-lg">17</span>{" "}
                  <span className="text-soft">{t("landing.statSpecimens")}</span>
                </dd>
              </div>
              <div>
                <dt className="sr-only">{t("landing.statXp")}</dt>
                <dd>
                  <span className="font-bold text-lg">+10</span>{" "}
                  <span className="text-soft">{t("landing.statXp")}</span>
                </dd>
              </div>
            </dl>
          </div>

          <div className="nb-sheet p-6" aria-label={t("landing.sampleAria")}>
            <div className="flex items-center justify-between gap-3">
              <p className="nb-data text-xs text-soft">EXP-03 · {t("landing.sampleExam")}</p>
              <span className="nb-stamp nb-stamp-pass">{t("exam.verdictPass")}</span>
            </div>
            <p className="nb-data text-4xl font-bold text-accent mt-2">
              +93 <span className="text-base font-medium">{t("modal.xpUnit")}</span>
            </p>
            <p className="nb-data text-xs text-soft mt-1">
              {t("landing.sampleBreakdown")}
            </p>
            <div className="nb-meter h-2.5 mt-4" aria-hidden="true">
              <div style={{ "--fill": 0.72 }} />
            </div>
            <p className="nb-data text-xs text-soft mt-2">
              {t("landing.sampleProgress")}
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="nb-specimen px-3 py-1.5 text-sm font-semibold">
                ⭐ {t("badges.risingStar.name")}
              </span>
              <span className="nb-specimen px-3 py-1.5 text-sm font-semibold">
                🧠 {t("badges.sharpMind.name")}
              </span>
            </div>
          </div>
        </section>

        <section aria-label={t("landing.stepsTitle")} className="mt-14">
          <h2 className="font-display font-extrabold text-2xl">{t("landing.stepsTitle")}</h2>
          <ol className="nb-sheet mt-4 grid grid-cols-1 md:grid-cols-3">
            <li className="p-6 md:border-r border-rule">
              <p className="nb-data text-xs text-soft">01</p>
              <h3 className="font-display font-bold mt-1">{t("landing.step1Title")}</h3>
              <p className="text-sm text-soft mt-1">
                {t("landing.step1Text")}
              </p>
            </li>
            <li className="p-6 md:border-r border-rule border-t border-rule md:border-t-0">
              <p className="nb-data text-xs text-soft">02</p>
              <h3 className="font-display font-bold mt-1">{t("landing.step2Title")}</h3>
              <p className="text-sm text-soft mt-1">
                {t("landing.step2Text")}
              </p>
            </li>
            <li className="p-6 border-t border-rule md:border-t-0">
              <p className="nb-data text-xs text-soft">03</p>
              <h3 className="font-display font-bold mt-1">{t("landing.step3Title")}</h3>
              <p className="text-sm text-soft mt-1">
                {t("landing.step3Text")}
              </p>
            </li>
          </ol>
        </section>

        <section aria-label={t("landing.ratesTitle")} className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="nb-sheet p-6">
            <h2 className="font-display font-extrabold text-xl">{t("landing.ratesTitle")}</h2>
            <dl className="nb-data text-sm mt-3 space-y-1.5">
              <div className="flex justify-between border-b border-rule pb-1.5">
                <dt className="text-soft">{t("landing.rateCorrect")}</dt>
                <dd className="font-bold">+10 XP</dd>
              </div>
              <div className="flex justify-between border-b border-rule pb-1.5">
                <dt className="text-soft">{t("landing.ratePass")}</dt>
                <dd className="font-bold">+10 XP</dd>
              </div>
              <div className="flex justify-between border-b border-rule pb-1.5">
                <dt className="text-soft">{t("landing.ratePerfect")}</dt>
                <dd className="font-bold">+20 XP</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-soft">{t("landing.rateStreak")}</dt>
                <dd className="font-bold">{t("landing.rateStreakBonus")}</dd>
              </div>
            </dl>
            <p className="text-sm text-soft mt-3">
              {t("landing.ratesNote")}
            </p>
          </div>
          <div className="nb-sheet p-6">
            <h2 className="font-display font-extrabold text-xl">{t("landing.authorsTitle")}</h2>
            <ul className="text-sm text-soft mt-3 space-y-2">
              <li>{t("landing.author1")}</li>
              <li>{t("landing.author2")}</li>
              <li>{t("landing.author3")}</li>
              <li>{t("landing.author4")}</li>
            </ul>
            <Link to="/register" className="nb-btn inline-block mt-4 py-2! px-4! text-sm">
              {t("landing.authorsCta")}
            </Link>
          </div>
        </section>

        <footer className="mt-14 pt-4 border-t border-rule flex flex-wrap justify-between gap-2">
          <p className="nb-data text-xs text-soft">{t("landing.footerTag")}</p>
          <p className="text-xs text-soft">
            <Link to="/login" className="text-accent font-semibold hover:underline">{t("landing.login")}</Link>
            {" · "}
            <Link to="/register" className="text-accent font-semibold hover:underline">{t("landing.register")}</Link>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default LandingPage;
