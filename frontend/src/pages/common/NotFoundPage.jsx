import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div className="nb-page flex flex-col items-center justify-center h-screen p-4 text-center">
      <p className="nb-data text-sm text-soft">{t("notFound.kicker")}</p>
      <h1 className="nb-data font-bold text-7xl mt-2">{t("notFound.code")}</h1>
      <h2 className="font-display font-extrabold text-2xl mt-2">{t("notFound.title")}</h2>
      <p className="text-sm text-soft mt-1 mb-5">{t("notFound.sub")}</p>
      <Link to="/" className="nb-btn">
        {t("notFound.home")}
      </Link>
    </div>
  );
}

export default NotFoundPage;
