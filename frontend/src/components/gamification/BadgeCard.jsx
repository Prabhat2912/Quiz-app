import React from "react";
import { useTranslation } from "react-i18next";
import { translateBadge } from "../../i18n";

function BadgeCard({ badge, locked = false, isNext = false }) {
  const { t } = useTranslation();
  const shown = translateBadge(t, badge);
  const icon = shown.icon || "⬢";
  const isEmoji = !icon.startsWith("ri-");
  return (
    <div
      className={`nb-specimen ${locked ? "nb-specimen-locked" : ""} ${
        isNext ? "border-accent!" : ""
      } flex flex-col items-center p-4 text-center`}
    >
      <span
        className="text-3xl mb-2 leading-none"
        aria-hidden="true"
      >
        {locked && !isNext ? (
          <i className="ri-lock-line text-soft"></i>
        ) : isEmoji ? (
          icon
        ) : (
          <i className={`${icon} text-accent`}></i>
        )}
      </span>
      <h3 className="font-display font-bold text-sm">{shown.name}</h3>
      <p className="text-xs text-soft mt-1">{shown.description}</p>
      {shown.level && (
        <p className="nb-data text-[11px] text-soft mt-1">
          {t("common.levelShort", { n: shown.level })}
        </p>
      )}
      {shown.earnedAt && !locked && (
        <p className="nb-data text-[11px] text-soft mt-1">
          {new Date(shown.earnedAt).toLocaleDateString()}
        </p>
      )}
      {locked && isNext && (
        <p className="nb-data text-[11px] text-accent font-semibold mt-1">
          {t("badges.nextUp")}
        </p>
      )}
    </div>
  );
}

export default BadgeCard;
