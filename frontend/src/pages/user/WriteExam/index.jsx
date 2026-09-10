import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getExamById } from "../../../apicalls/exams";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { message } from "antd";
import Instructions from "./Instructions";
import { addReport } from "../../../apicalls/reports";
import { getUserInfo } from "../../../apicalls/users";
import { SetUser } from "../../../redux/usersSlice";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { translateBadge } from "../../../i18n";
import LevelUpModal from "../../../components/gamification/LevelUpModal";

function WriteExam() {
  const [gamification, setGamification] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [examData, setExamData] = useState();
  const [questions, setQuestions] = useState([]);
  const [totalMarks, setTotalMarks] = useState(0);
  const [passingMarks, setPassingMarks] = useState(0);
  const [obtainedMarks, setObtainedMarks] = useState(0);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentAnswerResult, setCurrentAnswerResult] = useState([]);
  const [result, setResult] = useState();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [view, setView] = useState("instructions");
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [timeUp, setTimeUp] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const { user } = useSelector((state) => state.users);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const getExamDataById = async (id) => {
    try {
      dispatch(ShowLoading());
      const response = await getExamById(id);
      dispatch(HideLoading());
      if (response.success) {
        message.success(response.message);
        setExamData(response.data);
        setQuestions(response.data.questions);
        setSecondsLeft(response.data.duration);
        setTotalMarks(response.data.totalMarks);
        setPassingMarks(response.data.passingMarks);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const progress = ((selectedQuestionIndex + 1) / questions.length) * 100;

  const calculateResult = async () => {
    try {
      let correctAnswers = [];
      let wrongAnswers = [];

      questions.forEach((question, index) => {
        const selected = selectedOptions[index] || [];
        const correct = question.correctOptions || [question.correctOption];
        const isCorrect =
          correct.every((option) => selected.includes(option)) &&
          selected.length === correct.length;

        if (isCorrect) {
          correctAnswers.push(question);
        } else {
          wrongAnswers.push(question);
        }
      });

      let verdict = "Pass";
      const correctAnswersCount = correctAnswers.length;
      const obtainedMark =
        (correctAnswersCount / questions.length) * totalMarks;
      setObtainedMarks(obtainedMark);
      if (obtainedMark < passingMarks) {
        verdict = "Fail";
      }
      const tempResult = {
        correctAnswers,
        wrongAnswers,
        verdict,
      };
      setResult(tempResult);
      // Per-question picks for the attempt review (stored on the report).
      const detailedAnswers = questions.map((question, index) => {
        const selected = selectedOptions[index] || [];
        const correct = question.correctOptions || [question.correctOption];
        return {
          questionId: question._id,
          selectedOptions: selected,
          correctOptions: correct,
          isCorrect:
            correct.every((option) => selected.includes(option)) &&
            selected.length === correct.length,
          explanation: question.explanation || "",
        };
      });
      dispatch(ShowLoading());
      const response = await addReport({
        exam: id,
        result: tempResult,
        answers: detailedAnswers,
        user: user._id,
      });
      dispatch(HideLoading());
      if (response.success) {
        // Store gamification payload for celebration modal + result card
        if (response.data?.xpEarned !== undefined) {
          setGamification(response.data);
          setShowCelebration(true);
        } else {
          message.success(t("exam.quizDone"));
        }

        // Refresh user data to update XP/Level in header
        const userResponse = await getUserInfo();
        if (userResponse.success) {
          dispatch(SetUser(userResponse.data));
        }

        setView("result");
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  const startTimer = () => {
    let totalSeconds = examData.duration;
    const intervalId = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds = totalSeconds - 1;
        setSecondsLeft(totalSeconds);
      } else {
        setTimeUp(true);
      }
    }, 1000);
    setIntervalId(intervalId);
  };

  useEffect(() => {
    if (timeUp && view === "questions") {
      clearInterval(intervalId);
      calculateResult();
    }
  }, [timeUp]);

  useEffect(() => {
    if (id) {
      getExamDataById(id);
    }
  }, []);

  const handleAnswerSubmit = () => {
    setSubmitted(true);
    const currentQuestion = questions[selectedQuestionIndex];
    const selected = selectedOptions[selectedQuestionIndex] || [];
    const correct = currentQuestion.correctOptions || [
      currentQuestion.correctOption,
    ];
    const isCorrect =
      correct.every((option) => selected.includes(option)) &&
      selected.length === correct.length;
    setCurrentAnswerResult(isCorrect ? "Correct" : "Incorrect");
  };

  const toggleOption = (index, option) => {
    const correctOptionLength = questions[index].correctOptions?.length || 1; // Default to 1 if correctOptions isn't defined
    const currentSelected = selectedOptions[index] || [];

    if (correctOptionLength === 1) {
      // If only one option is correct, only allow one selection
      setSelectedOptions({
        ...selectedOptions,
        [index]: [option], // Replace any previous selection with the new one
      });
    } else {
      // Allow multiple selections for questions with more than one correct option
      if (currentSelected.includes(option)) {
        setSelectedOptions({
          ...selectedOptions,
          [index]: currentSelected.filter((opt) => opt !== option),
        });
      } else {
        setSelectedOptions({
          ...selectedOptions,
          [index]: [...currentSelected, option],
        });
      }
    }
  };

  return (
    examData && (
      <div className="mt-2 h-full">
        <p className="nb-data text-xs text-soft text-center">
          {t("exam.fileLabel")} · {examData.category}
        </p>
        <h1 className="text-center font-display font-extrabold text-2xl sm:text-3xl mt-1">{examData.name}</h1>
        <div className="divider mt-3"></div>

        {view === "instructions" && (
          <Instructions
            examData={examData}
            setExamData={setExamData}
            view={view}
            setView={setView}
            startTimer={startTimer}
          />
        )}

        {view === "questions" && questions.length > 0 && (
          <div className="flex flex-col gap-4 mt-4">
            <div className="flex items-center gap-3">
              <div className="nb-meter h-2.5 flex-1" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin="0" aria-valuemax="100" aria-label={t("exam.progressLabel")}>
                <div
                  style={{ "--fill": progress / 100 }}
                />
              </div>
                <span className="nb-data text-xs text-soft whitespace-nowrap">
                  {t("exam.ofQuestions", { a: selectedQuestionIndex + 1, b: questions.length })}
                </span>
            </div>

            <div className="flex flex-wrap justify-between items-start gap-2">
              <h2 className="font-display font-bold text-lg sm:text-xl flex flex-wrap items-center gap-2 min-w-0 break-words">
                <span className="nb-data text-sm text-soft font-medium">
                  Q{selectedQuestionIndex + 1}
                </span>
                {questions[selectedQuestionIndex].name}{" "}
                {(questions[selectedQuestionIndex]?.correctOptions?.length || 1) >
                1 ? (
                  <span className="nb-data text-[11px] font-bold uppercase tracking-wider bg-accent text-white dark:text-[#06231a] px-2 py-1 rounded-md">
                    {t("exam.multiBadge", {
                      n: questions[selectedQuestionIndex].correctOptions.length,
                    })}
                  </span>
                ) : (
                  <span className="nb-data text-[11px] font-bold uppercase tracking-wider border border-rule text-soft px-2 py-1 rounded-full">
                    {t("exam.singleBadge")}
                  </span>
                )}
              </h2>
              <div className="nb-data text-sm font-semibold text-accent whitespace-nowrap" role="timer" aria-label={t("exam.timer")}>
                <i className="ri-timer-line mr-1" aria-hidden="true"></i>
                {t("exam.timeLeft", {
                  time: `${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`,
                })}
              </div>
            </div>
            <div
              className="flex flex-col gap-2"
              role="group"
              aria-label={
                (questions[selectedQuestionIndex]?.correctOptions?.length || 1) > 1
                  ? t("exam.groupMulti", {
                      n: questions[selectedQuestionIndex].correctOptions.length,
                    })
                  : t("exam.groupSingle")
              }
            >
              {Object.keys(questions[selectedQuestionIndex].options).map(
                (option, index) => {
                  const multi =
                    (questions[selectedQuestionIndex]?.correctOptions?.length || 1) > 1;
                  const isSelected = (
                    selectedOptions[selectedQuestionIndex] || []
                  ).includes(option);
                  const isCorrectOption = (
                    questions[selectedQuestionIndex].correctOptions || [
                      questions[selectedQuestionIndex].correctOption,
                    ]
                  ).includes(option);

                  let optionClasses =
                    "option flex items-center p-3 cursor-pointer transition-colors duration-150";
                  if (!submitted) {
                    if (isSelected) {
                      optionClasses += " border-accent! nb-tint-accent";
                    } else {
                      optionClasses += " hover:border-accent";
                    }
                  }
                  if (submitted) {
                    if (isCorrectOption) {
                      optionClasses += " border-pass! nb-tint-pass";
                    } else if (isSelected && !isCorrectOption) {
                      optionClasses += " border-fail! nb-tint-fail";
                    }
                  }

                  return (
                    <button
                      type="button"
                      className={`${optionClasses} text-left w-full`}
                      key={index}
                      aria-pressed={isSelected}
                      disabled={submitted}
                      onClick={() => {
                        if (!submitted) {
                          toggleOption(selectedQuestionIndex, option);
                        }
                      }}
                    >
                      <span
                        aria-hidden="true"
                        className={`nb-data text-sm font-bold w-7 h-7 shrink-0 flex items-center justify-center border ${
                          multi ? "rounded-md" : "rounded-full"
                        } ${
                          isSelected
                            ? "bg-accent border-accent text-white dark:text-[#06231a]"
                            : "border-rule text-accent"
                        }`}
                      >
                        {option}
                      </span>
                      <span className="text-[15px]">
                        {questions[selectedQuestionIndex].options[option]}
                      </span>
                      {submitted && isCorrectOption && (
                        <i className="ri-check-line ml-auto text-pass" aria-label={t("exam.correctOption")}></i>
                      )}
                      {submitted && isSelected && !isCorrectOption && (
                        <i className="ri-close-line ml-auto text-fail" aria-label={t("exam.wrongSelection")}></i>
                      )}
                    </button>
                  );
                }
              )}
            </div>

            {submitted ? (
              <div className="flex flex-col items-center gap-3">
                <p
                  className={`nb-stamp ${
                    currentAnswerResult === "Correct"
                      ? "nb-stamp-pass"
                      : "nb-stamp-fail"
                  }`}
                >
                  {currentAnswerResult === "Correct"
                    ? t("exam.verdictCorrect")
                    : t("exam.verdictWrong")}
                </p>

                {selectedQuestionIndex < questions.length - 1 && (
                  <button
                    className="nb-btn"
                    onClick={() => {
                      setSelectedQuestionIndex(selectedQuestionIndex + 1);
                      setCurrentAnswerResult(null);
                      setSubmitted(false);
                    }}
                  >
                    {t("exam.nextQuestion")}
                  </button>
                )}
                {selectedQuestionIndex === questions.length - 1 && (
                  <button
                    className="nb-btn"
                    onClick={() => {
                      clearInterval(intervalId);
                      setTimeUp(true);
                    }}
                  >
                    {t("exam.fileRun")}
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full flex justify-center items-center">
                <button
                  className="nb-btn w-44 mt-2"
                  onClick={handleAnswerSubmit}
                >
                  {t("exam.logAnswer")}
                </button>
              </div>
            )}
          </div>
        )}
        {view === "result" && (
          <div className="flex justify-center mt-6">
            <div className="nb-sheet p-6 sm:p-8 w-full max-w-lg">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-display font-extrabold text-xl">{t("exam.resultTitle")}</h2>
                <span
                  className={`nb-stamp ${
                    result.verdict === "Pass" ? "nb-stamp-pass" : "nb-stamp-fail"
                  }`}
                >
                  {result.verdict === "Pass" ? t("exam.verdictPass") : t("exam.verdictFail")}
                </span>
              </div>
              {gamification && (
                <div className="nb-specimen p-4 mt-4">
                  <p className="nb-data text-2xl font-bold text-accent">
                    +{gamification.xpEarned} <span className="text-sm font-medium">{t("exam.xpEntered")}</span>
                  </p>
                  {gamification.xpBreakdown && (
                    <p className="nb-data text-xs text-soft mt-1">
                      {t("exam.breakCorrect", { n: gamification.xpBreakdown.perCorrect })}
                      {gamification.xpBreakdown.pass
                        ? ` · ${t("exam.breakPass", { n: gamification.xpBreakdown.pass })}`
                        : ""}
                      {gamification.xpBreakdown.perfect
                        ? ` · ${t("exam.breakPerfect", { n: gamification.xpBreakdown.perfect })}`
                        : ""}
                      {gamification.xpBreakdown.streak
                        ? ` · ${t("exam.breakStreak", { n: gamification.xpBreakdown.streak })}`
                        : ""}
                    </p>
                  )}
                  {gamification.leveledUp && (
                    <p className="nb-data text-sm font-bold mt-2">
                      {t("exam.levelUp", {
                        a: gamification.oldLevel,
                        b: gamification.newLevel,
                      })}
                    </p>
                  )}
                  {gamification.newBadges?.length > 0 && (
                    <p className="text-sm mt-1">
                      <span className="text-soft">{t("exam.specimensLabel")}</span>
                      <span className="font-semibold">
                        {gamification.newBadges
                          .map((b) => translateBadge(t, b).name)
                          .join(", ")}
                      </span>
                    </p>
                  )}
                </div>
              )}
              <dl className="nb-data text-sm mt-4 space-y-1.5">
                <div className="flex justify-between border-b border-rule pb-1.5">
                  <dt className="text-soft">{t("exam.totalMarks")}</dt>
                  <dd className="font-bold">{examData.totalMarks}</dd>
                </div>
                <div className="flex justify-between border-b border-rule pb-1.5">
                  <dt className="text-soft">{t("exam.passingMarks")}</dt>
                  <dd className="font-bold">{examData.passingMarks}</dd>
                </div>
                <div className="flex justify-between border-b border-rule pb-1.5">
                  <dt className="text-soft">{t("exam.obtained")}</dt>
                  <dd className="font-bold">{obtainedMarks}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-soft">{t("exam.wrongAnswers")}</dt>
                  <dd className="font-bold">{result.wrongAnswers.length}</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2 mt-5">
                <button
                  className="nb-btn-ghost"
                  onClick={() => {
                    setView("instructions");
                    setSelectedQuestionIndex(0);
                    setSelectedOptions({});
                    setSubmitted(false);
                    setCurrentAnswerResult(null);
                    setTimeUp(false);
                    setSecondsLeft(examData.duration);
                  }}
                >
                  {t("exam.runAgain")}
                </button>
                <button
                  className="nb-btn-ghost"
                  onClick={() => setView("review")}
                >
                  {t("exam.reviewEntries")}
                </button>
                <button
                  className="nb-btn"
                  onClick={() => navigate("/")}
                >
                  {t("exam.bench")}
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "review" && result && (
          <div className="flex flex-col gap-3 mt-4">
            <h2 className="font-display font-extrabold text-xl">{t("exam.reviewTitle")}</h2>
            {questions.map((question, index) => {
              const selected = selectedOptions[index] || [];
              const correct = question.correctOptions || [
                question.correctOption,
              ];
              const isCorrect =
                correct.every((option) => selected.includes(option)) &&
                selected.length === correct.length;

              return (
                <article
                  key={index}
                  className="nb-sheet p-4 sm:p-5"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`nb-stamp shrink-0 mt-0.5 ${
                        isCorrect ? "nb-stamp-pass" : "nb-stamp-fail"
                      }`}
                    >
                      {isCorrect ? t("exam.stampLogged") : t("exam.stampMissed")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold">
                        <span className="nb-data text-xs text-soft font-medium mr-2">
                          Q{index + 1}
                        </span>
                        {question.name}{" "}
                        {(question.correctOptions?.length || 1) > 1 && (
                          <span className="nb-data text-[11px] font-bold uppercase tracking-wider bg-accent text-white dark:text-[#06231a] px-2 py-0.5 rounded-md align-middle">
                            {t("exam.multiBadge", { n: question.correctOptions.length })}
                          </span>
                        )}
                      </h3>

                      <div className="flex flex-col gap-2 mt-3">
                        {Object.keys(question.options).map((option) => {
                          const isSelected = selected.includes(option);
                          const isCorrectOption = correct.includes(option);
                          const multi = (question.correctOptions?.length || 1) > 1;

                          let optionStyle = "option p-2.5 text-[15px] ";
                          if (isCorrectOption) {
                            optionStyle += "border-pass! nb-tint-pass font-medium";
                          } else if (isSelected && !isCorrectOption) {
                            optionStyle += "border-fail! nb-tint-fail";
                          }

                          return (
                            <div key={option} className={`${optionStyle} flex items-center gap-2`}>
                              <span
                                aria-hidden="true"
                                className={`nb-data text-xs font-bold w-6 h-6 shrink-0 flex items-center justify-center border ${
                                  multi ? "rounded" : "rounded-full"
                                } ${
                                  isSelected
                                    ? "bg-accent border-accent text-white dark:text-[#06231a]"
                                    : "border-rule text-soft"
                                }`}
                              >
                                {option}
                              </span>
                              <span>{question.options[option]}</span>
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

                      {!isCorrect && (
                        <div className="mt-3">
                          {question.explanation ? (
                            <div className="nb-specimen p-3">
                              <h4 className="font-display font-bold text-sm mb-1">
                                {t("exam.fieldNote")}
                              </h4>
                              <p className="text-sm">
                                {question.explanation}
                              </p>
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
              );
            })}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              <button
                className="nb-btn"
                onClick={() => {
                  setView("instructions");
                  setSelectedQuestionIndex(0);
                  setSelectedOptions({});
                  setSubmitted(false);
                  setCurrentAnswerResult(null);
                  setTimeUp(false);
                  setSecondsLeft(examData.duration);
                  setGamification(null);
                }}
              >
                {t("exam.runAgain")}
              </button>
              <button
                className="nb-btn-ghost"
                onClick={() => navigate("/")}
              >
                {t("exam.bench")}
              </button>
            </div>
          </div>
        )}
        {gamification && (
          <LevelUpModal
            visible={showCelebration}
            onClose={() => setShowCelebration(false)}
            xpEarned={gamification.xpEarned}
            oldLevel={gamification.oldLevel}
            newLevel={gamification.newLevel}
            leveledUp={gamification.leveledUp}
            newBadges={gamification.newBadges || []}
            totalXP={gamification.totalXP}
            onViewProgress={() => {
              setShowCelebration(false);
              navigate("/user/progress");
            }}
          />
        )}
      </div>
    )
  );
}

export default WriteExam;
