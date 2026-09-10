import React from "react";
import { getLevelProgress, getNextLevelBadge } from "../../utils/gamification";

function LevelProgressCard({ xp = 0, level = 1, compact = false }) {
  const progress = getLevelProgress(xp, level);
  const nextBadge = getNextLevelBadge(level);

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex items-baseline justify-between gap-2">
          <span className="nb-data text-sm font-bold">Lv {level || 1}</span>
          <span className="nb-data text-xs text-soft">
            {(xp || 0).toLocaleString()} XP
          </span>
        </div>
        <div className="nb-meter h-2 mt-1.5" role="progressbar" aria-valuenow={progress.progressPercentage} aria-valuemin="0" aria-valuemax="100" aria-label={`Progress to level ${level + 1}`}>
          <div
            style={{ "--fill": progress.progressPercentage / 100 }}
          />
        </div>
        {!progress.isMaxLevel && (
          <p className="nb-data text-[11px] text-soft mt-1">
            {progress.xpProgress}/{progress.xpNeeded} to Lv {level + 1}
          </p>
        )}
      </div>
    );
  }

  return (
    <section aria-label="Level and experience" className="nb-sheet p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="font-display font-extrabold text-lg">
          Level {level}
        </h2>
        <span className="nb-data text-xs text-soft">
          entry {String(level).padStart(3, "0")}
        </span>
      </div>
      <p className="nb-data text-4xl font-bold mt-1">
        {(xp || 0).toLocaleString()}
        <span className="text-base font-medium text-soft ml-1">XP</span>
      </p>
      <div className="nb-meter h-3 mt-4" role="progressbar" aria-valuenow={progress.progressPercentage} aria-valuemin="0" aria-valuemax="100" aria-label={`Progress to level ${level + 1}`}>
        <div
          style={{ "--fill": progress.progressPercentage / 100 }}
        />
      </div>
      <p className="nb-data text-xs text-soft mt-2">
        {progress.isMaxLevel ? (
          <>Maximum level recorded.</>
        ) : (
          <>
            {progress.xpProgress} / {progress.xpNeeded} XP to Level {level + 1}
          </>
        )}
      </p>
      {nextBadge && (
        <p className="text-sm mt-4 pt-3 border-t border-rule">
          <span className="text-soft">Next specimen: </span>
          <span className="font-semibold">
            {nextBadge.icon} {nextBadge.name}
          </span>{" "}
          <span className="nb-data text-xs text-soft">
            · Lv {nextBadge.level} · {nextBadge.level - level} to go
          </span>
        </p>
      )}
    </section>
  );
}

export default LevelProgressCard;
