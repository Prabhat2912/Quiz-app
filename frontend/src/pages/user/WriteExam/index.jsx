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

function WriteExam() {
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
      dispatch(ShowLoading());
      const response = await addReport({
        exam: id,
        result: tempResult,
        user: user._id,
      });
      dispatch(HideLoading());
      if (response.success) {
        // Show XP earned message if available
        if (response.data?.xpEarned) {
          message.success(
            `Quiz completed! You earned ${response.data.xpEarned} XP!`
          );
          if (response.data.leveledUp) {
            message.success(
              `🎉 Level Up! You're now Level ${response.data.newLevel}!`,
              3
            );
          }
          if (response.data.newBadges && response.data.newBadges.length > 0) {
            response.data.newBadges.forEach((badge) => {
              message.success(`🏅 New Badge Earned: ${badge.name}!`, 3);
            });
          }
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
      <div className="mt-2  h-full   ">
        <div className="divider"></div>
        <h1 className="text-center text-3xl font-bold">{examData.name}</h1>
        <div className="divider"></div>

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
          <div className="flex flex-col gap-4 mt-4  ">
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="bg-blue-600 dark:bg-black h-4 rounded-full transition-all duration-300 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="flex flex-wrap justify-between">
              <h1 className="text-2xl flex flex-wrap  font-semibold">
                {selectedQuestionIndex + 1} :{" "}
                {questions[selectedQuestionIndex].name}{" "}
                {questions[selectedQuestionIndex]?.correctOptions?.length >
                  1 && (
                  <span className="text-md text-red-500">Multiple Correct</span>
                )}
              </h1>
              <div className="text-xl font-medium">
                <span>{secondsLeft} seconds left</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {Object.keys(questions[selectedQuestionIndex].options).map(
                (option, index) => {
                  const isSelected = (
                    selectedOptions[selectedQuestionIndex] || []
                  ).includes(option);
                  const isCorrectOption = (
                    questions[selectedQuestionIndex].correctOptions || [
                      questions[selectedQuestionIndex].correctOption,
                    ]
                  ).includes(option);

                  let optionClasses =
                    "flex items-center p-2 rounded border cursor-pointer transition duration-200";
                  if (!submitted) {
                    if (isSelected) {
                      optionClasses += " bg-gray-400 border-gray-400";
                    }
                  }
                  if (submitted) {
                    if (isCorrectOption) {
                      optionClasses +=
                        " dark:bg-gray-400 dark:border-gray-600  bg-green-100 border-green-400";
                    } else if (isSelected && !isCorrectOption) {
                      optionClasses +=
                        " dark:bg-gray-600 dark:border-gray-800 bg-red-100 border-red-400";
                    } else {
                      optionClasses += " border-gray-300";
                    }
                  } else {
                    optionClasses +=
                      " hover:bg-gray-400 bg-gray-300 hover:border-gray-400 ";
                  }

                  return (
                    <div
                      className={optionClasses}
                      key={index}
                      onClick={() => {
                        if (!submitted) {
                          toggleOption(selectedQuestionIndex, option);
                        }
                      }}
                    >
                      <h1 className="text-xl">
                        {option} :{" "}
                        {questions[selectedQuestionIndex].options[option]}
                      </h1>
                    </div>
                  );
                }
              )}
            </div>

            {submitted ? (
              <div className="flex flex-col items-center">
                <h1
                  className={`text-xl font-bold ${
                    currentAnswerResult === "Correct"
                      ? "text-green-600 dark:text-gray-400 "
                      : "text-red-600 dark:text-gray-600"
                  }`}
                >
                  {currentAnswerResult} Answer
                </h1>

                {selectedQuestionIndex < questions.length - 1 && (
                  <button
                    className="bg-blue-500 dark:bg-black dark:hover:bg-black/80 text-white px-4 py-2 rounded mt-1 hover:bg-blue-600 "
                    onClick={() => {
                      setSelectedQuestionIndex(selectedQuestionIndex + 1);
                      setCurrentAnswerResult(null);
                      setSubmitted(false);
                    }}
                  >
                    Next Question
                  </button>
                )}
                {selectedQuestionIndex === questions.length - 1 && (
                  <button
                    className="bg-blue-500 dark:bg-black dark:hover:bg-black/50 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600 transition"
                    onClick={() => {
                      clearInterval(intervalId);
                      setTimeUp(true);
                    }}
                  >
                    Submit Exam
                  </button>
                )}
              </div>
            ) : (
              <div className="w-full flex justify-center items-center">
                <button
                  className="bg-green-500 dark:bg-black dark:hover:bg-black/50 w-40 text-white px-4 py-2 rounded mt-4 hover:bg-green-600 transition"
                  onClick={handleAnswerSubmit}
                >
                  Submit Answer
                </button>
              </div>
            )}
          </div>
        )}
        {view === "result" && (
          <div className="flex min-w-[250px] justify-center mt-6 gap-4">
            <div className="flex flex-col gap-4 bg-white p-6 rounded shadow-md">
              <h1 className="text-2xl font-bold">Result</h1>
              <div className="flex flex-col gap-2">
                <h1 className="text-md">Total Marks : {examData.totalMarks}</h1>
                <h1 className="text-md">
                  Passing Marks : {examData.passingMarks}
                </h1>
                <h1 className="text-md">Obtained Marks : {obtainedMarks}</h1>
                <h1 className="text-md">
                  Wrong Answers : {result.wrongAnswers.length}
                </h1>
                <h1 className="text-md">Verdict : {result.verdict}</h1>
              </div>
              <div className="flex gap-4 mt-4">
                <button
                  className="bg-yellow-500 dark:bg-black dark:hover:bg-black/50 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
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
                  Retake Exam
                </button>
                <button
                  className="bg-blue-500 dark:bg-black dark:hover:bg-black/50 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                  onClick={() => setView("review")}
                >
                  Review Answers
                </button>
                <button
                  className="bg-gray-500 dark:bg-black dark:hover:bg-black/50 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                  onClick={() => navigate("/")}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {view === "review" && result && (
          <div className="flex flex-col gap-4 mt-4">
            <h1 className="text-2xl font-bold mb-4">Review Your Answers</h1>
            {questions.map((question, index) => {
              const selected = selectedOptions[index] || [];
              const correct = question.correctOptions || [
                question.correctOption,
              ];
              const isCorrect =
                correct.every((option) => selected.includes(option)) &&
                selected.length === correct.length;

              // Debug log to check if explanation exists
              if (!isCorrect && !question.explanation) {
                console.log(
                  `Question ${index + 1} has no explanation:`,
                  question.name
                );
              }

              return (
                <div
                  key={index}
                  className={`flex flex-col p-4 border-2 rounded-lg shadow-sm ${
                    isCorrect
                      ? "bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600"
                      : "bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600"
                  }`}
                >
                  <div className="flex items-start gap-2 mb-3">
                    <span
                      className={`text-xl font-bold ${
                        isCorrect
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {isCorrect ? "✓" : "✗"}
                    </span>
                    <div className="flex-1">
                      <h1 className="text-lg font-semibold mb-2">
                        Question {index + 1}: {question.name}
                      </h1>

                      <div className="flex flex-col gap-2 mb-3">
                        {Object.keys(question.options).map((option) => {
                          const isSelected = selected.includes(option);
                          const isCorrectOption = correct.includes(option);

                          let optionStyle = "p-2 rounded border ";
                          if (isCorrectOption) {
                            optionStyle +=
                              "bg-green-200 dark:bg-green-800/40 border-green-500 font-medium";
                          } else if (isSelected && !isCorrectOption) {
                            optionStyle +=
                              "bg-red-200 dark:bg-red-800/40 border-red-500";
                          } else {
                            optionStyle +=
                              "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600";
                          }

                          return (
                            <div key={option} className={optionStyle}>
                              <span className="font-semibold">{option}:</span>{" "}
                              {question.options[option]}
                              {isCorrectOption && (
                                <span className="ml-2 text-green-700 dark:text-green-300">
                                  (Correct Answer)
                                </span>
                              )}
                              {isSelected && !isCorrectOption && (
                                <span className="ml-2 text-red-700 dark:text-red-300">
                                  (Your Answer)
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {!isCorrect && (
                        <div>
                          {question.explanation ? (
                            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded">
                              <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
                                Explanation:
                              </h3>
                              <p className="text-gray-800 dark:text-gray-300">
                                {question.explanation}
                              </p>
                            </div>
                          ) : (
                            <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-800 border-l-4 border-gray-400 rounded">
                              <p className="text-gray-600 dark:text-gray-400 text-sm italic">
                                No explanation available for this question yet.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex justify-center gap-4 mt-4">
              <button
                className="bg-yellow-500 dark:bg-yellow-600 text-white px-6 py-2 rounded hover:bg-yellow-600 dark:hover:bg-yellow-700 transition"
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
                Retake Exam
              </button>
              <button
                className="bg-gray-500 dark:bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-600 dark:hover:bg-gray-700 transition"
                onClick={() => navigate("/")}
              >
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    )
  );
}

export default WriteExam;
