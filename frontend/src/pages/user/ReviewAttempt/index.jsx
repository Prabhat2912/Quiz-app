import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { message } from "antd";
import { getReportById } from "../../../apicalls/reports";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import PageTitle from "../../../components/PageTitle";

/**
 * Attempt review: every question of one past quiz with your picks,
 * the correct answers and explanations. Linked from report rows.
 * Route: /user/reports/:reportId (owners and admins, enforced server-side).
 */
function ReviewAttemptPage() {
  const { reportId } = useParams();
  const { user: me } = useSelector((state) => state.users);
  const [report, setReport] = useState(null);
  const [failed, setFailed] = useState(false);
  const [failMessage, setFailMessage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetch = async () => {
      try {
        dispatch(ShowLoading());
        const res = await getReportById(reportId);
        dispatch(HideLoading());
        if (res.success) {
          setReport(res.data);
        } else {
          setFailMessage(res.message || t("reports.loadFail"));
          setFailed(true);
        }
      } catch (e) {
        dispatch(HideLoading());
        setFailed(true);
        setFailMessage(t("reports.loadFail"));
      }
    };
    if (reportId) fetch();
  }, [dispatch, reportId, t]);

  const backToReports = () => {
    navigate(me?.isAdmin ? "/admin/reports" : "/user/reports");
  };

  if (failed) {
    return (
      <div>
        <PageTitle title={t("reports.reviewTitle")} sub={t("reports.notFound")} />
        <div className="nb-sheet p-6 text-sm text-soft">
          {failMessage || t("reports.loadFail")}
        </div>
        <button className="nb-btn-ghost mt-4" onClick={backToReports}>
          {t("reports.backToReports")}
        </button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex justify-center items-center h-64 text-soft">
        {t("common.loading")}
      </div>
    );
  }

  const result = report.result || {};
  const correctList = result.correctAnswers || [];
  const wrongList = result.wrongAnswers || [];
  const total = correctList.length + wrongList.length;
  const percentage =
    total > 0 ? Math.round((correctList.length / total) * 100) : 0;
  const verdict = result.verdict;

  // Join stored picks with the snapshotted question docs.
  const qmap = new Map();
  [...correctList, ...wrongList].forEach((q) => {
    if (q && q._id) qmap.set(String(q._id), q);
  });

  let entries;
  let legacy = false;
  if (report.answers && report.answers.length > 0) {
    entries = report.answers.map((a, i) => {
      const q = qmap.get(String(a.questionId)) || null;
      const correct = a.correctOptions || [];
      const selected = a.selectedOptions || [];
      return {
        key: String(a.questionId || i),
        index: i,
        name: q?.name || null,
        options: q?.options || null,
        correct,
        selected,
        isCorrect: !!a.isCorrect,
        explanation: a.explanation || q?.explanation || "",
        multi: correct.length > 1,
      };
    });
  } else {
    legacy = true;
    const wrap = (q, i, isCorrect) => ({
      key: `${isCorrect ? "c" : "w"}${i}`,
      index: i,
      name: q?.name || null,
      options: q?.options || null,
      correct: q?.correctOptions || [],
      selected: isCorrect ? q?.correctOptions || [] : [],
      isCorrect,
      explanation: q?.explanation || "",
      multi: (q?.correctOptions || []).length > 1,
    });
    entries = [
      ...correctList.map((q, i) => wrap(q, i, true)),
      ...wrongList.map((q, i) => wrap(q, i, false)),
    ];
  }

  const examName = report.exam?.name || t("reports.deletedExam");

  return (
    <div>
      <PageTitle
        title={t("reports.reviewTitle")}
        sub={`${examName} · ${
          report.createdAt
            ? new Date(report.createdAt).toLocaleDateString()
            : ""
        }`}
      />

      <div className="nb-sheet p-6 flex flex-wrap items-center gap-x-6 gap-y-3">
        <p className="nb-data text-4xl font-bold">{percentage}%</p>
        {verdict && (
          <span
            className={`nb-stamp ${
              verdict === "Pass" ? "nb-stamp-pass" : "nb-stamp-fail"
            }`}
          >
            {verdict === "Pass" ? t("exam.verdictPass") : t("exam.verdictFail")}
          </span>
        )}
        <dl className="nb-data text-sm flex gap-5">
          <div>
            <dt className="sr-only">{t("exam.verdictCorrect")}</dt>
            <dd>
              <span className="font-bold">{correctList.length}</span> / {total}
            </dd>
          </div>
          {report.xpEarned ? (
            <div>
              <dt className="sr-only">XP</dt>
              <dd className="font-bold text-accent">+{report.xpEarned} XP</dd>
            </div>
          ) : null}
        </dl>
      </div>

      {legacy && (
        <p className="nb-specimen mt-4 p-3 text-sm text-soft">
          {t("reports.legacyNote")}
        </p>
      )}

      <div className="flex flex-col gap-3 mt-4">
        {entries.map((entry) => (
          <article key={entry.key} className="nb-sheet p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span
                className={`nb-stamp shrink-0 mt-0.5 ${
                  entry.isCorrect ? "nb-stamp-pass" : "nb-stamp-fail"
                }`}
              >
                {entry.isCorrect
                  ? t("exam.stampLogged")
                  : t("exam.stampMissed")}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold">
                  <span className="nb-data text-xs text-soft font-medium mr-2">
                    Q{entry.index + 1}
                  </span>
                  {entry.name || `Question ${entry.index + 1}`}{" "}
                  {entry.multi && (
                    <span className="nb-data text-[11px] font-bold uppercase tracking-wider bg-accent text-white dark:text-[#06231a] px-2 py-0.5 rounded-md align-middle">
                      {t("exam.multiBadge", { n: entry.correct.length })}
                    </span>
                  )}
                </h3>

                {entry.options ? (
                  <div className="flex flex-col gap-2 mt-3">
                    {Object.keys(entry.options).map((option) => {
                      const isSelected = entry.selected.includes(option);
                      const isCorrectOption = entry.correct.includes(option);

                      let optionStyle = "option p-2.5 text-[15px] ";
                      if (isCorrectOption) {
                        optionStyle += "border-pass! nb-tint-pass font-medium";
                      } else if (isSelected && !isCorrectOption) {
                        optionStyle += "border-fail! nb-tint-fail";
                      }

                      return (
                        <div
                          key={option}
                          className={`${optionStyle} flex items-center gap-2`}
                        >
                          <span
                            aria-hidden="true"
                            className={`nb-data text-xs font-bold w-6 h-6 shrink-0 flex items-center justify-center border ${
                              entry.multi ? "rounded" : "rounded-full"
                            } ${
                              isSelected
                                ? "bg-accent border-accent text-white dark:text-[#06231a]"
                                : "border-rule text-soft"
                            }`}
                          >
                            {option}
                          </span>
                          <span>{entry.options[option]}</span>
                          {isCorrectOption && (
                            <span className="ml-2 text-xs font-semibold text-pass">
                              {t("exam.correctTag")}
                            </span>
                          )}
                          {isSelected && !isCorrectOption && (
                            <span className="ml-2 text-xs font-semibold text-fail">
                              {t("exam.yourPick")}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {entry.correct.map((letter) => (
                      <span
                        key={`c-${letter}`}
                        className="nb-specimen px-3 py-1.5 text-sm font-semibold"
                      >
                        {letter} · {t("exam.correctTag")}
                      </span>
                    ))}
                    {entry.selected
                      .filter((letter) => !entry.correct.includes(letter))
                      .map((letter) => (
                        <span
                          key={`s-${letter}`}
                          className="nb-specimen px-3 py-1.5 text-sm font-semibold"
                        >
                          {letter} · {t("exam.yourPick")}
                        </span>
                      ))}
                  </div>
                )}

                {!entry.isCorrect && (
                  <div className="mt-3">
                    {entry.explanation ? (
                      <div className="nb-specimen p-3">
                        <h4 className="font-display font-bold text-sm mb-1">
                          {t("exam.fieldNote")}
                        </h4>
                        <p className="text-sm">{entry.explanation}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-soft italic">
                        {t("exam.noNote")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      <button className="nb-btn-ghost mt-4" onClick={backToReports}>
        {t("reports.backToReports")}
      </button>
    </div>
  );
}

export default ReviewAttemptPage;
