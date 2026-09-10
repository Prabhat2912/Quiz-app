import React from "react";

function BadgeCard({ badge, locked = false, isNext = false }) {
  const icon = badge.icon || "⬢";
  const isEmoji = !icon.startsWith("ri-");
  return (
    <div
      className={`nb-specimen ${locked ? "nb-specimen-locked" : ""} ${
        isNext ? "!border-accent" : ""
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
      <h3 className="font-display font-bold text-sm">{badge.name}</h3>
      <p className="text-xs text-soft mt-1">{badge.description}</p>
      {badge.level && (
        <p className="nb-data text-[11px] text-soft mt-1">
          Lv {badge.level}
        </p>
      )}
      {badge.earnedAt && !locked && (
        <p className="nb-data text-[11px] text-soft mt-1">
          {new Date(badge.earnedAt).toLocaleDateString()}
        </p>
      )}
      {locked && isNext && (
        <p className="nb-data text-[11px] text-accent font-semibold mt-1">
          next up
        </p>
      )}
    </div>
  );
}

export default BadgeCard;
