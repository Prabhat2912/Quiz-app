import React from 'react'
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function Instructions(props) {
  const { examData, setView, startTimer } = props
  const { t } = useTranslation();
  const navigate = useNavigate();
  const rules = t("exam.instructions", {
    duration: Math.max(1, Math.round((examData.duration || 0) / 60)),
    totalMarks: examData.totalMarks,
    passingMarks: examData.passingMarks,
    returnObjects: true,
  });
  return (
    <div className='flex flex-col items-center mt-2 gap-5 max-w-2xl mx-auto w-full'>
      <h2 className='font-display font-extrabold text-xl text-center'>
        {t("exam.instructionsTitle")}
      </h2>
      <ol className="nb-sheet p-6 list-decimal list-inside flex flex-col gap-2 text-[15px] w-full">
        {rules.map((rule, i) => (
          <li key={i}>{rule}</li>
        ))}
      </ol>
      <div className='flex flex-wrap justify-center gap-2'>
        <button className='nb-btn-ghost'
          onClick={() => navigate(-1)}
        >
          {t("common.back")}
        </button>
        <button className='nb-btn'
          onClick={() => {
            startTimer();
            setView("questions")
          }}
        >{t("exam.startExam")}</button>
      </div>
    </div>
  )
}

export default Instructions
