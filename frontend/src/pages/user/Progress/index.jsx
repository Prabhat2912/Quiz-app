import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { getUserProgress } from "../../../apicalls/reports";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { message } from "antd";
import PageTitle from "../../../components/PageTitle";
import LevelProgressCard from "../../../components/gamification/LevelProgressCard";
import BadgeCard from "../../../components/gamification/BadgeCard";
import { LEVEL_BADGES } from "../../../utils/gamification";
import { translateBadge } from "../../../i18n";

function Progress() {
  const [progressData, setProgressData] = useState(null);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        dispatch(ShowLoading());
        const response = await getUserProgress();
        dispatch(HideLoading());
        if (response.success) {
          setProgressData(response.data);
        } else {
          message.error(response.message);
        }
      } catch (error) {
        dispatch(HideLoading());
        message.error(t("progress.loadFail"));
      }
    };

    fetchProgressData();
  }, [dispatch, t]);

  if (!progressData) {
    return (
      <div className="flex justify-center items-center h-screen">
        {t("common.loading")}
      </div>
    );
  }

  const { user, stats, levelProgress, recentScores, categoryPerformance } =
    progressData;

  // Prefer server-computed catalog; fall back to local LEVEL_BADGES for level milestones
  const levelBadges = progressData.levelBadges?.length
    ? progressData.levelBadges
    : LEVEL_BADGES.map((b) => {
        const earned = (user.badges || []).find((ub) => ub.name === b.name);
        return { ...b, earned: !!earned, earnedAt: earned?.earnedAt || null };
      });
  const achievementBadges =
    progressData.achievementBadges ||
    (user.badges || []).filter(
      (b) => !LEVEL_BADGES.some((lb) => lb.name === b.name)
    );
  const nextBadgeMilestone = progressData.nextBadge || null;
  const nextName = nextBadgeMilestone
    ? translateBadge(t, { name: nextBadgeMilestone.name }).name
    : null;
  const xpHistory = progressData.xpHistory || [];
  const maxXp = Math.max(1, ...xpHistory.map((h) => h.xp));

  return (
    <div>
      <PageTitle
        title={t("progress.title")}
        sub={t("progress.sub")}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <LevelProgressCard xp={user.xp} level={user.level} />

        <section aria-label={t("progress.runsFiled")} className="nb-sheet p-6">
          <h2 className="font-display font-bold">{t("progress.runsFiled")}</h2>
          <p className="nb-data text-4xl font-bold mt-1">
            {stats.totalQuizzesCompleted}
          </p>
          <dl className="nb-data text-xs text-soft mt-2 space-y-1">
            <div className="flex justify-between">
              <dt>{t("progress.questions")}</dt>
              <dd className="text-ink font-bold">{stats.totalQuestionsAttempted}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t("progress.perfectRuns")}</dt>
              <dd className="text-ink font-bold">{stats.perfectScores || 0}</dd>
            </div>
            <div className="flex justify-between">
              <dt>{t("progress.passed")}</dt>
              <dd className="text-ink font-bold">{stats.passedQuizzes || 0}</dd>
            </div>
          </dl>
        </section>

        <section aria-label={t("progress.accuracy")} className="nb-sheet p-6">
          <h2 className="font-display font-bold">{t("progress.accuracy")}</h2>
          <p className="nb-data text-4xl font-bold mt-1">
            {Number(stats.accuracy || 0).toFixed(1)}
            <span className="text-base font-medium text-soft">%</span>
          </p>
          <p className="nb-data text-xs text-soft mt-2">
            {t("progress.correctEntered", { n: stats.totalCorrectAnswers })}
          </p>
        </section>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <section aria-label={t("progress.streakNow")} className="nb-sheet p-6">
          <h2 className="font-display font-bold">{t("progress.streakNow")}</h2>
          <p className="nb-data text-4xl font-bold mt-1">
            {user.stats?.currentStreak || 0}
            <span className="text-base font-medium text-soft"> {t("progress.daysUnit")}</span>
          </p>
          <p className="text-sm text-soft mt-1">{t("progress.streakHint")}</p>
        </section>

        <section aria-label={t("progress.streakBest")} className="nb-sheet p-6">
          <h2 className="font-display font-bold">{t("progress.streakBest")}</h2>
          <p className="nb-data text-4xl font-bold mt-1">
            {user.stats?.longestStreak || 0}
            <span className="text-base font-medium text-soft"> {t("progress.daysUnit")}</span>
          </p>
          <p className="text-sm text-soft mt-1">{t("progress.streakBestHint")}</p>
        </section>
      </div>

      {/* Specimen cabinet — always visible so learners see what to unlock */}
      <section aria-label={t("progress.cabinet")} className="nb-sheet mt-4 p-6">
        <h2 className="font-display font-extrabold text-lg">{t("progress.cabinet")}</h2>
        <p className="nb-data text-xs text-soft mt-1 mb-4">
          {progressData.badgeCatalog
            ? t("progress.affixedOf", {
                a: (user.badges || []).length,
                b: progressData.badgeCatalog.length,
              })
            : t("progress.affixed", { n: (user.badges || []).length })}
          {nextBadgeMilestone && nextName
            ? ` · ${t("progress.nextBadge", {
                icon: nextBadgeMilestone.icon,
                name: nextName,
                level: nextBadgeMilestone.level,
              })}`
            : ` · ${t("progress.cabinetDone")}`}
        </p>

        <div className="mb-6">
          <h3 className="font-display font-bold text-sm mb-3">
            {t("progress.levelMilestones")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {levelBadges.map((milestone) => {
              const earned = milestone.earned ?? !!(user.badges || []).find(
                (b) => b.name === milestone.name
              );
              const isLocked = !earned && user.level < (milestone.level || 0);
              const isNext =
                !earned &&
                nextBadgeMilestone?.name === milestone.name;
              return (
                <BadgeCard
                  key={milestone.name}
                  badge={{
                    ...milestone,
                    earnedAt: milestone.earnedAt,
                  }}
                  locked={!earned}
                  isNext={isNext || (!earned && !isLocked)}
                />
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="font-display font-bold text-sm mb-3">
            {t("progress.fieldAchievements")}
          </h3>
          {achievementBadges.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {achievementBadges.map((badge, index) => (
                <BadgeCard
                  key={badge.name || index}
                  badge={badge}
                  locked={!badge.earned && !badge.earnedAt}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-soft">
              {t("progress.noAchievements")}
            </p>
          )}
        </div>
      </section>

      {/* XP ledger */}
      {xpHistory.length > 0 && (
        <section aria-label={t("progress.xpLedger")} className="nb-sheet mt-4 p-6">
          <h2 className="font-display font-extrabold text-lg">{t("progress.xpLedger")}</h2>
          <div className="flex items-end gap-2 h-32 mt-4" role="img" aria-label={t("progress.xpLedgerHint")}>
            {xpHistory.slice(-12).map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                <div
                  className="w-full bg-accent rounded-t min-h-[4px]"
                  style={{ height: `${Math.max(4, (h.xp / maxXp) * 100)}px` }}
                  title={`${h.label}: +${h.xp} XP`}
                />
                <span className="nb-data text-[10px] text-soft truncate w-full text-center">
                  +{h.xp}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent runs */}
      <section aria-label={t("progress.recentRuns")} className="nb-sheet mt-4 p-6">
        <h2 className="font-display font-extrabold text-lg">{t("progress.recentRuns")}</h2>
        {recentScores.length > 0 ? (
          <ol className="mt-2">
            {recentScores.map((score, index) => (
              <li
                key={index}
                className="nb-row flex justify-between items-center gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="font-semibold truncate">{score.examName}</p>
                  <p className="nb-data text-xs text-soft">
                    {new Date(score.date).toLocaleDateString()}
                    {score.xpEarned ? ` · +${score.xpEarned} XP` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0 flex items-center gap-3">
                  <p className="nb-data text-lg font-bold">
                    {Number(score.percentage || 0).toFixed(0)}%
                  </p>
                  <span
                    className={`nb-stamp ${
                      score.verdict === "Pass"
                        ? "nb-stamp-pass"
                        : "nb-stamp-fail"
                    }`}
                  >
                    {score.verdict === "Pass"
                      ? t("exam.verdictPass")
                      : t("exam.verdictFail")}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-soft mt-2">
            {t("progress.noRuns")}
          </p>
        )}
      </section>

      {/* Subject readings */}
      <section aria-label={t("progress.subjects")} className="nb-sheet mt-4 p-6">
        <h2 className="font-display font-extrabold text-lg">{t("progress.subjects")}</h2>
        {categoryPerformance && Object.keys(categoryPerformance).length > 0 ? (
          <div className="space-y-4 mt-2">
            {Object.entries(categoryPerformance).map(([category, data]) => (
              <div key={category} className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-display font-bold">{category}</h3>
                  <span className="nb-data text-xs text-soft">
                    {t("common.run_other", { count: data.attempted })} ·{" "}
                    {Number(data.averageScore || 0).toFixed(0)}%
                  </span>
                </div>
                <div className="nb-meter h-2.5" role="progressbar" aria-valuenow={Math.round(Number(data.averageScore) || 0)} aria-valuemin="0" aria-valuemax="100" aria-label={t("progress.subjectAria", { category })}>
                  <div
                    style={{ "--fill": (Number(data.averageScore) || 0) / 100 }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-soft mt-2">
            {t("progress.noSubjects")}
          </p>
        )}
      </section>

      {levelProgress && (
        <details className="mt-4 text-xs text-soft">
          <summary className="cursor-pointer">{t("progress.levelDetails")}</summary>
          <pre className="nb-data mt-1 p-3 nb-sheet overflow-auto">
            {JSON.stringify(levelProgress, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

export default Progress;
