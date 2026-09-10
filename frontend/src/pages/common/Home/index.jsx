import { message } from "antd";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getAllExams } from "../../../apicalls/exams";
import PageTitle from "../../../components/PageTitle";
import LevelProgressCard from "../../../components/gamification/LevelProgressCard";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { getNextLevelBadge } from "../../../utils/gamification";
import { translateBadge } from "../../../i18n";

function HomePage() {
  const [exams, setExams] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const user = useSelector((state) => state.users.user);
  const getExams = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllExams();
      dispatch(HideLoading());
      if (response.success) {
        setExams(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };
  useEffect(() => {
    getExams();
  }, []);
  return (
    user && (
      <div>
        <PageTitle
          title={t("home.greeting", { name: user.name })}
          sub={t("home.sub")}
        />
        {!user.isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <LevelProgressCard xp={user.xp || 0} level={user.level || 1} />
            <div className="nb-sheet p-6 flex flex-col justify-center">
              <h2 className="font-display font-bold">{t("home.specimens")}</h2>
              <p className="nb-data text-4xl font-bold mt-1">
                {(user.badges || []).length}
              </p>
              <p className="text-sm text-soft">
                {(() => {
                  const next = getNextLevelBadge(user.level || 1);
                  return next
                    ? t("home.nextBadge", {
                        icon: next.icon,
                        name: translateBadge(t, next).name,
                        level: next.level,
                      })
                    : t("home.cabinetDone");
                })()}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  className="nb-btn py-2! px-3! text-sm"
                  onClick={() => navigate("/user/progress")}
                >
                  {t("common.openLogbook")}
                </button>
                <button
                  className="nb-btn-ghost py-2! px-3! text-sm"
                  onClick={() => navigate("/leaderboard")}
                >
                  {t("common.standings")}
                </button>
              </div>
            </div>
            <div className="nb-sheet p-6 flex flex-col justify-center">
              <h2 className="font-display font-bold">{t("home.rates")}</h2>
              <dl className="nb-data text-sm mt-2 space-y-1">
                <div className="flex justify-between">
                  <dt className="text-soft">{t("home.rateCorrect")}</dt>
                  <dd className="font-bold">+10 XP</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-soft">{t("home.ratePass")}</dt>
                  <dd className="font-bold">+10 XP</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-soft">{t("home.ratePerfect")}</dt>
                  <dd className="font-bold">+20 XP</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-soft">{t("home.rateStreak")}</dt>
                  <dd className="font-bold">{t("home.rateStreakBonus")}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
        <div className="nb-sheet mt-6 overflow-hidden">
          <div className="px-5 pt-4 pb-3 flex items-baseline justify-between">
            <h2 className="font-display font-extrabold text-lg">
              {user.isAdmin ? t("home.benchAdmin") : t("home.benchLearner")}
            </h2>
            <span className="nb-data text-xs text-soft">
              {t("common.entry_other", { count: exams.length })}
            </span>
          </div>
          {exams && exams.length > 0 ? (
            <ol>
              {exams.map((exam, index) => (
                <li
                  key={exam._id || index}
                  className="nb-row flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4"
                >
                  <span className="nb-data text-xs text-soft w-14 shrink-0">
                    EXP-{String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-full sm:min-w-0 sm:flex-1">
                    <p className="font-display font-bold break-words">{exam.name}</p>
                    <p className="mt-1 flex flex-wrap gap-1.5">
                      <span className="nb-chip">{exam.category}</span>
                      <span className="nb-chip">
                        {exam.language === "hi" ? "हिन्दी" : "English"}
                      </span>
                    </p>
                  </div>
                  <dl className="nb-data flex gap-5 text-xs text-soft">
                    <div>
                      <dt className="sr-only">{t("home.questions")}</dt>
                      <dd>
                        <span className="text-ink font-bold text-sm">
                          {exam.questions.length}
                        </span>{" "}
                        {t("home.questions")}
                      </dd>
                    </div>
                    <div>
                      <dt className="sr-only">{t("home.marks")}</dt>
                      <dd>
                        <span className="text-ink font-bold text-sm">
                          {exam.totalMarks}
                        </span>{" "}
                        {t("home.marks")}
                      </dd>
                    </div>
                    <div>
                      <dt className="sr-only">{t("home.duration")}</dt>
                      <dd>
                        <span className="text-ink font-bold text-sm">
                          {Math.round((exam.duration || 0) / 60)}
                        </span>{" "}
                        {t("home.duration")}
                      </dd>
                    </div>
                  </dl>
                  {user.isAdmin ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="nb-btn py-2! px-4! text-sm"
                        onClick={() => navigate(`/user/write-exam/${exam._id}`)}
                      >
                        {t("home.beginRun")}
                      </button>
                      <button
                        className="nb-btn-ghost py-2! px-3! text-sm"
                        onClick={() => navigate(`/admin/exams/edit/${exam._id}`)}
                      >
                        {t("home.openFile")}
                      </button>
                    </div>
                  ) : (
                    <button
                      className="nb-btn py-2! px-4! text-sm"
                      onClick={() => navigate(`/user/write-exam/${exam._id}`)}
                    >
                      {t("home.beginRun")}
                    </button>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <div className="px-5 py-12 text-center">
              <p className="font-display font-bold text-lg">{t("home.emptyTitle")}</p>
              <p className="text-sm text-soft mt-1">
                {user.isAdmin
                  ? t("home.emptyAdmin")
                  : t("home.emptyLearner")}
              </p>
              {user.isAdmin && (
                <button
                  className="nb-btn mt-4"
                  onClick={() => navigate("/admin/exams/add")}
                >
                  {t("home.fileFirst")}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  );
}

export default HomePage;
