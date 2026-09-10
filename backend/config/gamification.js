/**
 * Centralized Gamification Config — single source of truth for XP, Levels, Badges.
 *
 * XP RULES:
 *  - 10 XP per correct answer
 *  - +10 XP pass bonus (verdict === 'Pass', not already perfect — perfect also passes so gets both)
 *  - +20 XP perfect-score bonus (100%)
 *  - + streak bonus: min(currentStreak, 7) XP (rewards consistency, capped)
 *
 * LEVEL FORMULA (progressive, reachable):
 *  - XP to go from level L -> L+1 = BASE_XP + (L-1) * GROWTH
 *  - BASE_XP = 100, GROWTH = 25, MAX_LEVEL = 100
 *  - L1->2 = 100, L2->3 = 125, L3->4 = 150 ... L9->10 = 300
 *  - Total to L5 ≈ 550 XP (~7 quizzes), to L10 ≈ 1800 XP (~22 quizzes)
 *
 * BADGES (17 total):
 *  - 7 level badges (5,10,20,30,50,60,100) — original 10/30/60/100 kept with same names
 *  - 10 achievement badges (quizzes: 1/5/10/20/50, accuracy: 80%/100%, streak: 3/7/30)
 */

const MAX_LEVEL = 100;
const BASE_XP_FOR_NEXT_LEVEL = 100;
const XP_GROWTH_PER_LEVEL = 25;

const XP_PER_CORRECT = 10;
const PERFECT_SCORE_BONUS = 20;
const PASS_BONUS = 10;
const MAX_STREAK_BONUS = 7; // +1 per streak day, capped at 7

// XP needed to go from `level` to `level + 1`
function xpForNextLevel(level) {
  if (level < 1) return BASE_XP_FOR_NEXT_LEVEL;
  if (level >= MAX_LEVEL) return 0;
  return BASE_XP_FOR_NEXT_LEVEL + (level - 1) * XP_GROWTH_PER_LEVEL;
}

// Total cumulative XP required to REACH `level` (level 1 = 0)
function getXPForLevel(level) {
  if (level <= 1) return 0;
  if (level > MAX_LEVEL) level = MAX_LEVEL;
  let total = 0;
  for (let l = 1; l < level; l++) {
    total += xpForNextLevel(l);
  }
  return total;
}

// Level derived from total XP (1..MAX_LEVEL)
function calculateLevel(xp) {
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

// Full progress breakdown for a given xp/level — safe for UI + API
function getLevelProgress(xp = 0, level) {
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

// ---- Badge catalog ----
// type: 'level' | 'quizzes' | 'accuracy' | 'streak'
// For 'level': criteria.value = required level
// For 'quizzes': criteria.value = required totalQuizzesCompleted
// For 'accuracy': criteria.value = required % in a single quiz
// For 'streak': criteria.value = required currentStreak (or longestStreak)

const LEVEL_BADGES = [
  { name: "Rising Star", description: "Reached Level 5", icon: "⭐", level: 5, type: "level" },
  { name: "Bronze Achiever", description: "Reached Level 10", icon: "🥉", level: 10, type: "level" },
  { name: "Determined Learner", description: "Reached Level 20", icon: "💪", level: 20, type: "level" },
  { name: "Silver Champion", description: "Reached Level 30", icon: "🥈", level: 30, type: "level" },
  { name: "Elite Scholar", description: "Reached Level 50", icon: "🌟", level: 50, type: "level" },
  { name: "Gold Master", description: "Reached Level 60", icon: "🥇", level: 60, type: "level" },
  { name: "Legendary Scholar", description: "Reached Level 100 — Maximum Level!", icon: "👑", level: 100, type: "level" },
];

const ACHIEVEMENT_BADGES = [
  { name: "First Steps", description: "Completed your first quiz", icon: "ri-flag-line", type: "quizzes", criteria: { value: 1 } },
  { name: "Learner", description: "Completed 5 quizzes", icon: "ri-book-2-line", type: "quizzes", criteria: { value: 5 } },
  { name: "Quiz Explorer", description: "Completed 10 quizzes", icon: "ri-compass-3-line", type: "quizzes", criteria: { value: 10 } },
  { name: "Dedicated Learner", description: "Completed 20 quizzes", icon: "ri-medal-line", type: "quizzes", criteria: { value: 20 } },
  { name: "Knowledge Master", description: "Completed 50 quizzes", icon: "ri-star-line", type: "quizzes", criteria: { value: 50 } },
  { name: "Sharp Mind", description: "Scored 80% or higher in a quiz", icon: "ri-brain-line", type: "accuracy", criteria: { value: 80 } },
  { name: "Perfect Score", description: "Achieved 100% in a quiz", icon: "ri-trophy-line", type: "accuracy", criteria: { value: 100 } },
  { name: "Streak Starter", description: "3-day learning streak", icon: "ri-fire-line", type: "streak", criteria: { value: 3 } },
  { name: "Streak Warrior", description: "7-day learning streak", icon: "ri-fire-line", type: "streak", criteria: { value: 7 } },
  { name: "Unstoppable", description: "30-day learning streak", icon: "ri-rocket-line", type: "streak", criteria: { value: 30 } },
];

const ALL_BADGES = [...LEVEL_BADGES, ...ACHIEVEMENT_BADGES];

// XP breakdown for one quiz attempt
function calculateXP({ correctCount, totalQuestions, verdict, streakAfter = 0 }) {
  const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
  const isPerfect = totalQuestions > 0 && correctCount === totalQuestions;
  const isPass = verdict === "Pass";
  let xp = correctCount * XP_PER_CORRECT;
  const bonuses = { pass: 0, perfect: 0, streak: 0 };
  if (isPass) {
    xp += PASS_BONUS;
    bonuses.pass = PASS_BONUS;
  }
  if (isPerfect) {
    xp += PERFECT_SCORE_BONUS;
    bonuses.perfect = PERFECT_SCORE_BONUS;
  }
  const streakBonus = Math.min(Math.max(streakAfter || 0, 0), MAX_STREAK_BONUS);
  // Only award streak bonus if there is at least 1 correct (avoid farming empty submits)
  if (correctCount > 0 && streakBonus > 0) {
    xp += streakBonus;
    bonuses.streak = streakBonus;
  }
  return { xpEarned: xp, accuracy, isPerfect, isPass, bonuses };
}

// Pure badge check — takes plain user-like { badges, level, stats } + last-quiz accuracy
// Returns array of badge objects to award (with earnedAt). No DB writes.
function checkBadgesToAward(userLike, lastQuizAccuracy = 0) {
  const existing = new Set((userLike.badges || []).map((b) => b.name));
  const toAward = [];
  const level = userLike.level || 1;
  const stats = userLike.stats || {};
  const totalQuizzes = stats.totalQuizzesCompleted || 0;
  const streak = Math.max(stats.currentStreak || 0, stats.longestStreak || 0);

  for (const b of LEVEL_BADGES) {
    if (level >= b.level && !existing.has(b.name) && !toAward.find((x) => x.name === b.name)) {
      toAward.push({ name: b.name, description: b.description, icon: b.icon, level: b.level, type: "level", earnedAt: new Date() });
    }
  }
  for (const b of ACHIEVEMENT_BADGES) {
    if (existing.has(b.name) || toAward.find((x) => x.name === b.name)) continue;
    if (b.type === "quizzes" && totalQuizzes >= b.criteria.value) {
      toAward.push({ name: b.name, description: b.description, icon: b.icon, type: b.type, earnedAt: new Date() });
    } else if (b.type === "accuracy" && lastQuizAccuracy >= b.criteria.value) {
      toAward.push({ name: b.name, description: b.description, icon: b.icon, type: b.type, earnedAt: new Date() });
    } else if (b.type === "streak" && streak >= b.criteria.value) {
      toAward.push({ name: b.name, description: b.description, icon: b.icon, type: b.type, earnedAt: new Date() });
    }
  }
  return toAward;
}

function getNextLevelBadge(currentLevel) {
  return LEVEL_BADGES.find((b) => b.level > currentLevel) || null;
}

module.exports = {
  MAX_LEVEL,
  BASE_XP_FOR_NEXT_LEVEL,
  XP_GROWTH_PER_LEVEL,
  XP_PER_CORRECT,
  PERFECT_SCORE_BONUS,
  PASS_BONUS,
  MAX_STREAK_BONUS,
  LEVEL_BADGES,
  ACHIEVEMENT_BADGES,
  ALL_BADGES,
  xpForNextLevel,
  getXPForLevel,
  calculateLevel,
  getLevelProgress,
  calculateXP,
  checkBadgesToAward,
  getNextLevelBadge,
};
