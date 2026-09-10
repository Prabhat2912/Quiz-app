import React from "react";
import { useTranslation } from "react-i18next";
import { getLevelProgress, getNextLevelBadge } from "../../utils/gamification";
import { translateBadge } from "../../i18n";

function LevelProgressCard({ xp = 0, level = 1, compact = false }) {
  const { t } = useTranslation();
  const progress = getLevelProgress(xp, level);
  const rawNext = getNextLevelBadge(level);
  const nextBadge = rawNext ? translateBadge(t, rawNext) : null;

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex items-baseline justify-between gap-2">
          <span className="nb-data text-sm font-bold">{t("common.levelShort", { n: level || 1 })}</span>
          <span className="nb-data text-xs text-soft">
            {t("common.xp", { n: (xp || 0).toLocaleString() })}
          </span>
        </div>
        <div className="nb-meter h-2 mt-1.5" role="progressbar" aria-valuenow={progress.progressPercentage} aria-valuemin="0" aria-valuemax="100" aria-label={t("levelCard.progressAria", { n: level + 1 })}>
          <div
            style={{ "--fill": progress.progressPercentage / 100 }}
          />
        </div>
        {!progress.isMaxLevel && (
          <p className="nb-data text-[11px] text-soft mt-1">
            {t("common.xpToNext", {
              a: progress.xpProgress,
              b: progress.xpNeeded,
              n: level + 1,
            })}
          </p>
        )}
      </div>
    );
  }

  return (
    <section aria-label={t("levelCard.levelExperience")} className="nb-sheet p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display font-extrabold text-lg">
          {t("levelCard.level", { n: level })}
        </h2>
        <span className="nb-data text-xs text-soft">
          {t("common.entryNo", { n: String(level).padStart(3, "0") })}
        </span>
      </div>
      <p className="nb-data text-4xl font-bold mt-1">
        {(xp || 0).toLocaleString()}
        <span className="text-base font-medium text-soft ml-1">{t("levelCard.xpUnit")}</span>
      </p>
      <div className="nb-meter h-3 mt-4" role="progressbar" aria-valuenow={progress.progressPercentage} aria-valuemin="0" aria-valuemax="100" aria-label={t("levelCard.progressAria", { n: level + 1 })}>
        <div
          style={{ "--fill": progress.progressPercentage / 100 }}
        />
      </div>
      <p className="nb-data text-xs text-soft mt-2">
        {progress.isMaxLevel ? (
          <>{t("levelCard.maxLevel")}</>
        ) : (
          <>
            {t("levelCard.progressTo", {
              a: progress.xpProgress,
              b: progress.xpNeeded,
              n: level + 1,
            })}
          </>
        )}
      </p>
      {nextBadge && (
        <p className="text-sm mt-4 pt-3 border-t border-rule">
          <span className="text-soft">{t("levelCard.nextMilestone")} </span>
          <span className="font-semibold">
            {nextBadge.icon} {nextBadge.name}
          </span>{" "}
          <span className="nb-data text-xs text-soft">
            {t("levelCard.atLevel", { n: nextBadge.level })} ·{" "}
            {t("levelCard.levelsToGo", { n: nextBadge.level - level })}
          </span>
        </p>
      )}
    </section>
  );
}

export default LevelProgressCard;
