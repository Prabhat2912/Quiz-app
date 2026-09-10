// Shared gamification helpers — mirrors backend/config/gamification.js
// Keep in sync if backend XP/level formula changes.

export const MAX_LEVEL = 100;
export const BASE_XP_FOR_NEXT_LEVEL = 100;
export const XP_GROWTH_PER_LEVEL = 25;

export function xpForNextLevel(level) {
  if (level < 1) return BASE_XP_FOR_NEXT_LEVEL;
  if (level >= MAX_LEVEL) return 0;
  return BASE_XP_FOR_NEXT_LEVEL + (level - 1) * XP_GROWTH_PER_LEVEL;
}

export function getXPForLevel(level) {
  if (level <= 1) return 0;
  if (level > MAX_LEVEL) level = MAX_LEVEL;
  let total = 0;
  for (let l = 1; l < level; l++) total += xpForNextLevel(l);
  return total;
}

export function calculateLevel(xp) {
  if (!xp || xp <= 0) return 1;
  let level = 1;
  let consumed = 0;
  while (level < MAX_LEVEL) {
    const need = xpForNextLevel(level);
    if (xp < consumed + need) return level;
    consumed += need;
    level++;
  }
  return MAX_LEVEL;
}

export function getLevelProgress(xp = 0, level) {
  const currentLevel = level || calculateLevel(xp);
  if (currentLevel >= MAX_LEVEL) {
    const xpForCurrent = getXPForLevel(MAX_LEVEL);
    return {
      currentLevel: MAX_LEVEL,
      currentXP: xp,
      xpForCurrentLevel: xpForCurrent,
      xpForNextLevel: xpForCurrent,
      xpProgress: xp - xpForCurrent,
      xpNeeded: 0,
      progressPercentage: 100,
      isMaxLevel: true,
    };
  }
  const xpForCurrent = getXPForLevel(currentLevel);
  const xpForNext = getXPForLevel(currentLevel + 1);
  const xpProgress = Math.max(0, xp - xpForCurrent);
  const xpNeeded = Math.max(1, xpForNext - xpForCurrent);
  return {
    currentLevel,
    currentXP: xp,
    xpForCurrentLevel: xpForCurrent,
    xpForNextLevel: xpForNext,
    xpProgress,
    xpNeeded,
    progressPercentage: Math.min(100, parseFloat(((xpProgress / xpNeeded) * 100).toFixed(2))),
    isMaxLevel: false,
  };
}

export const LEVEL_BADGES = [
  { name: "Rising Star", description: "Reached Level 5", icon: "⭐", level: 5 },
  { name: "Bronze Achiever", description: "Reached Level 10", icon: "🥉", level: 10 },
  { name: "Determined Learner", description: "Reached Level 20", icon: "💪", level: 20 },
  { name: "Silver Champion", description: "Reached Level 30", icon: "🥈", level: 30 },
  { name: "Elite Scholar", description: "Reached Level 50", icon: "🌟", level: 50 },
  { name: "Gold Master", description: "Reached Level 60", icon: "🥇", level: 60 },
  { name: "Legendary Scholar", description: "Reached Level 100", icon: "👑", level: 100 },
];

export function getNextLevelBadge(currentLevel) {
  return LEVEL_BADGES.find((b) => b.level > currentLevel) || null;
}

export function isLevelBadge(name) {
  return LEVEL_BADGES.some((b) => b.name === name);
}
