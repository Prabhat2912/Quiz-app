import React, { useEffect } from "react";
import { Modal } from "antd";

/**
 * Result record modal shown after quiz submit when XP/level/badges changed.
 * Props: visible, onClose, xpEarned, oldLevel, newLevel, leveledUp, newBadges[], totalXP, onViewProgress
 */
function LevelUpModal({
  visible,
  onClose,
  xpEarned = 0,
  oldLevel = 1,
  newLevel = 1,
  leveledUp = false,
  newBadges = [],
  totalXP = 0,
  onViewProgress,
}) {
  useEffect(() => {
    if (visible && leveledUp) {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        [523, 659, 784].forEach((f, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = f;
          o.start(ctx.currentTime + i * 0.12);
          o.stop(ctx.currentTime + i * 0.12 + 0.15);
        });
      } catch (e) {
        // audio not available — ignore
      }
    }
  }, [visible, leveledUp]);

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      centered
      width={420}
    >
      <div className="text-center p-2">
        <div key={String(visible)} className="nb-stamp-land inline-block">
          <span className="nb-stamp nb-stamp-pass text-base! px-5! py-2!">
            Recorded
          </span>
        </div>
        <h2 className="font-display font-extrabold text-2xl mt-3">
          Run complete
        </h2>
        <p className="nb-data text-3xl font-bold text-accent mt-2">
          +{xpEarned} <span className="text-base font-medium">XP</span>
        </p>
        <p className="nb-data text-xs text-soft">
          total {(totalXP || 0).toLocaleString()} XP
        </p>

        {leveledUp && (
          <p className="nb-data text-sm font-bold mt-4">
            Level {oldLevel} → {newLevel}
          </p>
        )}

        {newBadges && newBadges.length > 0 && (
          <div className="mt-4 pt-3 border-t border-rule">
            <h3 className="font-display font-bold text-sm mb-2">
              Specimens affixed
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {newBadges.map((b, i) => (
                <span
                  key={i}
                  className="nb-specimen px-3 py-1.5 text-sm font-semibold"
                >
                  {b.icon && !b.icon.startsWith("ri-") ? `${b.icon} ` : ""}
                  {b.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 justify-center mt-5">
          {onViewProgress && (
            <button className="nb-btn" onClick={onViewProgress}>
              Open logbook
            </button>
          )}
          <button className="nb-btn-ghost" onClick={onClose}>
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default LevelUpModal;
