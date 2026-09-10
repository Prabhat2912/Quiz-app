import React from "react";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../i18n";

/**
 * EN ⇄ HI switch. Shows the *other* language's name.
 */
function LangSwitch({ compact = false }) {
  const { t, i18n } = useTranslation();
  const isHi = i18n.language === "hi";

  return (
    <button
      type="button"
      onClick={() => setLanguage(isHi ? "en" : "hi")}
      aria-label={t("lang.change")}
      title={t("lang.change")}
      className={`flex items-center gap-1 cursor-pointer rounded-lg border border-rule text-soft hover:text-accent font-semibold ${
        compact ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm"
      }`}
    >
      <i className="ri-translate-2" aria-hidden="true"></i>
      {!compact && <span>{isHi ? "EN" : "हिंदी"}</span>}
    </button>
  );
}

export default LangSwitch;
