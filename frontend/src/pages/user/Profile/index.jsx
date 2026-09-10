import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { message } from "antd";
import { getUserProgress } from "../../../apicalls/reports";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import PageTitle from "../../../components/PageTitle";
import LevelProgressCard from "../../../components/gamification/LevelProgressCard";
import BadgeCard from "../../../components/gamification/BadgeCard";

function ProfilePage() {
  const { user } = useSelector((state) => state.users);
  const [progress, setProgress] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetch = async () => {
      try {
        dispatch(ShowLoading());
        const res = await getUserProgress();
        dispatch(HideLoading());
        if (res.success) setProgress(res.data);
        else message.error(res.message);
      } catch (e) {
        dispatch(HideLoading());
        message.error(t("profile.loadFail"));
      }
    };
    fetch();
  }, [dispatch, t]);

  if (!user) return null;

  const badges = progress?.user?.badges || user.badges || [];
  const levelBadges = progress?.levelBadges || [];
  const achievementBadges = progress?.achievementBadges || [];

  return (
    <div className="max-w-4xl mx-auto">
      <PageTitle title={t("profile.title")} sub={t("profile.sub")} />
      <div className="nb-sheet p-6 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full bg-accent text-white dark:text-[#06231a] flex items-center justify-center font-display font-extrabold text-2xl shrink-0"
          aria-hidden="true"
        >
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="font-display font-extrabold text-xl truncate">{user.name}</h2>
          <p className="text-sm text-soft truncate">{user.email}</p>
          <p className="nb-data text-xs text-soft mt-1">
            {t("common.levelShort", { n: user.level || 1 })} ·{" "}
            {t("common.xp", { n: (user.xp || 0).toLocaleString() })} ·{" "}
            {badges.length} ·{" "}
            {user.isAdmin ? t("nav.roleAdmin") : t("nav.roleLearner")}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <LevelProgressCard xp={user.xp || 0} level={user.level || 1} />
        <section aria-label={t("profile.readings")} className="nb-sheet p-6">
          <h3 className="font-display font-bold">{t("profile.readings")}</h3>
          <dl className="nb-data grid grid-cols-2 gap-2 text-sm mt-2">
            <div className="flex justify-between border-b border-rule pb-1">
              <dt className="text-soft">{t("profile.statRuns")}</dt>
              <dd className="font-bold">{progress?.stats?.totalQuizzesCompleted ?? "—"}</dd>
            </div>
            <div className="flex justify-between border-b border-rule pb-1">
              <dt className="text-soft">{t("profile.statAccuracy")}</dt>
              <dd className="font-bold">{progress?.stats?.accuracy ?? "—"}%</dd>
            </div>
            <div className="flex justify-between border-b border-rule pb-1">
              <dt className="text-soft">{t("profile.statPerfect")}</dt>
              <dd className="font-bold">{progress?.stats?.perfectScores ?? "—"}</dd>
            </div>
            <div className="flex justify-between border-b border-rule pb-1">
              <dt className="text-soft">{t("profile.statPassed")}</dt>
              <dd className="font-bold">{progress?.stats?.passedQuizzes ?? "—"}</dd>
            </div>
            <div className="flex justify-between border-b border-rule pb-1">
              <dt className="text-soft">{t("profile.statStreak")}</dt>
              <dd className="font-bold">{progress?.stats?.currentStreak ?? "—"}{t("profile.streakUnit")}</dd>
            </div>
            <div className="flex justify-between border-b border-rule pb-1">
              <dt className="text-soft">{t("profile.statBest")}</dt>
              <dd className="font-bold">{progress?.stats?.longestStreak ?? "—"}{t("profile.streakUnit")}</dd>
            </div>
          </dl>
          <button
            className="nb-btn py-2! px-3! text-sm mt-4"
            onClick={() => navigate("/user/progress")}
          >
            {t("common.openLogbook")}
          </button>
        </section>
      </div>

      {badges.length > 0 ? (
        <section aria-label={t("profile.cabinet")} className="nb-sheet mt-4 p-6">
          <h3 className="font-display font-bold">{t("profile.cabinet")} ({badges.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {badges.slice(0, 8).map((b, i) => (
              <BadgeCard key={b.name || i} badge={{ ...b, earned: true }} />
            ))}
          </div>
          {(levelBadges.length > 0 || achievementBadges.length > 0) && (
            <button
              className="mt-3 text-sm text-accent font-semibold hover:underline"
              onClick={() => navigate("/user/progress")}
            >
              {t("profile.seeAll")}
            </button>
          )}
        </section>
      ) : (
        <div className="nb-sheet mt-4 p-6 text-sm text-soft">
          {t("profile.empty")}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
