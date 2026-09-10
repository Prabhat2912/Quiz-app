import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import hi from "./hi.json";

const STORAGE_KEY = "quiz-lang";

const saved = (() => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    return null;
  }
})();

i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi } },
  lng: saved === "hi" ? "hi" : "en",
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

if (typeof document !== "undefined") {
  document.documentElement.lang = i18n.language || "en";
}

export const setLanguage = (lng) => {
  const next = lng === "hi" ? "hi" : "en";
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch (e) {
    // private mode — language just won't persist
  }
  if (typeof document !== "undefined") {
    document.documentElement.lang = next;
  }
  return i18n.changeLanguage(next);
};

// Badge names/descriptions ship from the backend in English. The catalog
// is fixed (17 entries), so known ones are mapped to translations with a
// graceful fallback to the stored text.
const BADGE_SLUGS = {
  "Rising Star": "risingStar",
  "Bronze Achiever": "bronzeAchiever",
  "Determined Learner": "determinedLearner",
  "Silver Champion": "silverChampion",
  "Elite Scholar": "eliteScholar",
  "Gold Master": "goldMaster",
  "Legendary Scholar": "legendaryScholar",
  "First Steps": "firstSteps",
  Learner: "learner",
  "Quiz Explorer": "quizExplorer",
  "Dedicated Learner": "dedicatedLearner",
  "Knowledge Master": "knowledgeMaster",
  "Sharp Mind": "sharpMind",
  "Perfect Score": "perfectScore",
  "Streak Starter": "streakStarter",
  "Streak Warrior": "streakWarrior",
  Unstoppable: "unstoppable",
};

export const translateBadge = (t, badge) => {
  if (!badge) return badge;
  const slug = BADGE_SLUGS[badge.name];
  if (!slug) return badge;
  return {
    ...badge,
    name: t(`badges.${slug}.name`, { defaultValue: badge.name }),
    description:
      badge.description !== undefined
        ? t(`badges.${slug}.description`, { defaultValue: badge.description })
        : badge.description,
  };
};

export default i18n;
