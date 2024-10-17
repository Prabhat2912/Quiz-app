import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { getExamById } from '../../../apicalls/exams'
import { HideLoading, ShowLoading } from '../../../redux/loaderSlice'
import { message } from 'antd'
import Instructions from './Instructions'
import { addReport } from '../../../apicalls/reports'
import { useSelector } from 'react-redux'

function WriteExam() {
  const [examData, setExamData] = useState()
  const [questions, setQuestions] = useState([])
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [currentAnswerResult, setCurrentAnswerResult] = useState([])
  const [result, setResult] = useState()
  const { id } = useParams()
  const dispatch = useDispatch()
  const [view, setView] = useState("instructions")
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [timeUp, setTimeUp] = useState(false)
  const [intervalId, setIntervalId] = useState(null)
  const { user } = useSelector(state => state.users)
  const navigate = useNavigate();

  const getExamDataById = async (id) => {
    try {
      dispatch(ShowLoading())
      const response = await getExamById(id)
      dispatch(HideLoading())
      if (response.success) {
        message.success(response.message)
        setExamData(response.data)
        setQuestions(response.data.questions)
        setSecondsLeft(response.data.duration)
      } else {
        message.error(response.message)
      }
    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }

  const progress = ((selectedQuestionIndex + 1) / questions.length) * 100;


  const calculateResult = async () => {
    try {
      let correctAnswers = [];
      let wrongAnswers = [];

      questions.forEach((question, index) => {
        const selected = selectedOptions[index] || [];
        const correct = question.correctOptions || [question.correctOption];
        const isCorrect = correct.every(option => selected.includes(option)) && selected.length === correct.length;

        if (isCorrect) {
          correctAnswers.push(question);
        } else {
          wrongAnswers.push(question);
        }
      })

      let verdict = "Pass";
      if (correctAnswers.length < examData.passingMarks) {
        verdict = "Fail";
      }
      const tempResult = {
        correctAnswers,
        wrongAnswers,
        verdict,
      }
      setResult(tempResult)
      dispatch(ShowLoading())
      const response = await addReport({
        exam: id,
        result: tempResult,
        user: user._id
      })
      dispatch(HideLoading())
      if (response.success) {
        setView("result");
      } else {
        message.error(response.message)
      }
    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }

  const startTimer = () => {
    let totalSeconds = examData.duration;
    const intervalId = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds = totalSeconds - 1;
        setSecondsLeft(totalSeconds)
      } else {
        setTimeUp(true);
      }
    }, 1000);
    setIntervalId(intervalId)
  }

  useEffect(() => {
    if (timeUp && view === "questions") {
      clearInterval(intervalId)
      calculateResult();
    }
  }, [timeUp])

  useEffect(() => {
    if (id) {
      getExamDataById(id)
    }
  }, [])

  const handleAnswerSubmit = () => {
    setSubmitted(true);
    const currentQuestion = questions[selectedQuestionIndex];
    const selected = selectedOptions[selectedQuestionIndex] || [];
    const correct = currentQuestion.correctOptions || [currentQuestion.correctOption];
    const isCorrect = correct.every(option => selected.includes(option)) && selected.length === correct.length;
    setCurrentAnswerResult(isCorrect ? 'Correct' : 'Incorrect');
  };

  const toggleOption = (index, option) => {
    const correctOptionLength = questions[index].correctOptions?.length || 1; // Default to 1 if correctOptions isn't defined
    const currentSelected = selectedOptions[index] || [];

    if (correctOptionLength === 1) {
      // If only one option is correct, only allow one selection
      setSelectedOptions({
        ...selectedOptions,
        [index]: [option]  // Replace any previous selection with the new one
      });
    } else {
      // Allow multiple selections for questions with more than one correct option
      if (currentSelected.includes(option)) {
        setSelectedOptions({
          ...selectedOptions,
          [index]: currentSelected.filter(opt => opt !== option)
        });
      } else {
        setSelectedOptions({
          ...selectedOptions,
          [index]: [...currentSelected, option]
        });
      }
    }
  };


  return (
    examData && (
      <div className='mt-2  h-full   '>
        <div className='divider'></div>
        <h1 className='text-center text-3xl font-bold'>{examData.name}</h1>
        <div className='divider'></div>

        {view === "instructions" &&
          <Instructions
            examData={examData}
            setExamData={setExamData}
            view={view}
            setView={setView}
            startTimer={startTimer}
          />
        }

        {(view === "questions" && questions.length > 0) &&


          <div className='flex flex-col gap-4 mt-4  '>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
              <div
                className="bg-blue-600 dark:bg-black h-4 rounded-full transition-all duration-300 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className='flex justify-between'>
              <h1 className='text-2xl font-semibold'>
                {selectedQuestionIndex + 1} : {questions[selectedQuestionIndex].name}  {questions[selectedQuestionIndex]?.correctOptions?.length > 1 && <span className='text-md text-red-500'>Multiple Correct</span>}
              </h1>
              <div className='text-xl font-medium'>
                <span>{secondsLeft} seconds left</span>
              </div>
            </div>
            <div className='flex flex-col gap-2'>

              {Object.keys(questions[selectedQuestionIndex].options).map((option, index) => {
                const isSelected = (selectedOptions[selectedQuestionIndex] || []).includes(option);
                const isCorrectOption = (questions[selectedQuestionIndex].correctOptions || [questions[selectedQuestionIndex].correctOption]).includes(option);

                let optionClasses = "flex items-center p-2 rounded border cursor-pointer transition duration-200";
                if (!submitted) {
                  if (isSelected) {
                    optionClasses += " bg-gray-400 border-gray-400";
                  }
                }
                if (submitted) {
                  if (isCorrectOption) {
                    optionClasses += " dark:bg-gray-400 dark:border-gray-600  bg-green-100 border-green-400";
                  } else if (isSelected && !isCorrectOption) {
                    optionClasses += " dark:bg-gray-600 dark:border-gray-800 bg-red-100 border-red-400";
                  } else {
                    optionClasses += " border-gray-300";
                  }
                } else {
                  optionClasses += " hover:bg-gray-400 bg-gray-300 hover:border-gray-400 ";
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
                    <h1 className='text-xl'>
                      {option} : {questions[selectedQuestionIndex].options[option]}
                    </h1>
                  </div>
                );
              })}

            </div>

            {submitted ? (
              <div className='flex flex-col items-center'>

                <h1 className={`text-xl font-bold ${currentAnswerResult === 'Correct' ? 'text-green-600 dark:text-gray-400 ' : 'text-red-600 dark:text-gray-600'}`}>
                  {currentAnswerResult} Answer
                </h1>

                {selectedQuestionIndex < questions.length - 1 &&
                  <button className='bg-blue-500 dark:bg-black dark:hover:bg-black/80 text-white px-4 py-2 rounded mt-1 hover:bg-blue-600 '
                    onClick={() => {
                      setSelectedQuestionIndex(selectedQuestionIndex + 1);
                      setCurrentAnswerResult(null);
                      setSubmitted(false);
                    }}
                  >
                    Next Question
                  </button>
                }
                {selectedQuestionIndex === questions.length - 1 &&
                  <button className='bg-blue-500 dark:bg-black dark:hover:bg-black/50 text-white px-4 py-2 rounded mt-4 hover:bg-blue-600 transition'
                    onClick={() => {
                      clearInterval(intervalId);
                      setTimeUp(true);
                    }}
                  >
                    Submit Exam
                  </button>
                }
              </div>
            ) : (

              <div className='w-full flex justify-center items-center' >
                <button className='bg-green-500 dark:bg-black dark:hover:bg-black/50 w-40 text-white px-4 py-2 rounded mt-4 hover:bg-green-600 transition'
                  onClick={handleAnswerSubmit}
                >
                  Submit Answer
                </button>

              </div>
            )}
          </div>
        }
        {view === "result" &&
          <div className='flex justify-center mt-6 gap-4'>
            <div className='flex flex-col gap-4 bg-white p-6 rounded shadow-md'>
              <h1 className='text-2xl font-bold'>Result</h1>
              <div className='flex flex-col gap-2'>
                <h1 className='text-md'>Total Marks : {examData.totalMarks}</h1>
                <h1 className='text-md'>Passing Marks : {examData.passingMarks}</h1>
                <h1 className='text-md'>Obtained Marks : {result.correctAnswers.length}</h1>
                <h1 className='text-md'>Wrong Answers : {result.wrongAnswers.length}</h1>
                <h1 className='text-md'>Verdict : {result.verdict}</h1>
              </div>
              <div className='flex gap-4 mt-4'>
                <button className='bg-yellow-500 dark:bg-black dark:hover:bg-black/50 text-white px-4 py-2 rounded hover:bg-yellow-600 transition'
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
                <button className='bg-blue-500 dark:bg-black dark:hover:bg-black/50 text-white px-4 py-2 rounded hover:bg-blue-600 transition' onClick={() => setView("review")}>
                  Review Answers
                </button>
                <button className='bg-gray-500 dark:bg-black dark:hover:bg-black/50 text-white px-4 py-2 rounded hover:bg-gray-600 transition'
                  onClick={() => navigate("/")}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        }

        {view === "review" && result &&
          <div className='flex flex-col gap-4 mt-4'>
            {questions.map((question, index) => {
              const selected = selectedOptions[index] || [];
              const correct = question.correctOptions || [question.correctOption];
              const isCorrect = correct.every(option => selected.includes(option)) && selected.length === correct.length;

              return (
                <div key={index} className={`flex flex-col p-4 border rounded ${isCorrect ? 'bg-green-100 dark:bg-gray-400 ' : 'bg-red-100 dark:bg-gray-600  '}`}>
                  <h1 className='text-lg font-semibold'>{index + 1} : {question.name}</h1>
                  <h1 className='text-md'>Submitted Answer : {selected.join(', ') || "N/A"}</h1>
                  <h1 className='text-md'>Correct Answer : {correct.join(', ')}</h1>
                </div>
              )
            })}
            <div className='flex justify-center gap-2 mt-4'>
              <button className='bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition'
                onClick={() => {
                  setView("instructions");
                  setSelectedQuestionIndex(0);
                  setSelectedOptions({});
                  setTimeUp(false);
                  setSecondsLeft(examData.duration);
                  setSubmitted(false);
                  setCurrentAnswerResult(null);
                  setTimeUp(false);
                  setSecondsLeft(examData.duration);
                  navigate("/");
                  navigate("/");
                }}
              >
                Close
              </button>
            </div>
          </div>
        }
      </div>
    )
  )
}

export default WriteExam;
