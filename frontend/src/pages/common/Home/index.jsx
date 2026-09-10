import { message } from "antd";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAllExams } from "../../../apicalls/exams";
import PageTitle from "../../../components/PageTitle";
import LevelProgressCard from "../../../components/gamification/LevelProgressCard";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { getNextLevelBadge } from "../../../utils/gamification";

function HomePage() {
  const [exams, setExams] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.users.user);
  const getExams = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getAllExams();
      dispatch(HideLoading());
      if (response.success) {
        setExams(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };
  useEffect(() => {
    getExams();
  }, []);
  return (
    user && (
      <div>
        <PageTitle
          title={`Hi ${user.name}`}
          sub="Pick an experiment, run it, record the result."
        />
        {!user.isAdmin && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <LevelProgressCard xp={user.xp || 0} level={user.level || 1} />
            <div className="nb-sheet p-6 flex flex-col justify-center">
              <h2 className="font-display font-bold">Specimens</h2>
              <p className="nb-data text-4xl font-bold mt-1">
                {(user.badges || []).length}
              </p>
              <p className="text-sm text-soft">
                {(() => {
                  const next = getNextLevelBadge(user.level || 1);
                  return next
                    ? `Next: ${next.icon} ${next.name} · Lv ${next.level}`
                    : "Cabinet complete — legendary.";
                })()}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  className="nb-btn py-2! px-3! text-sm"
                  onClick={() => navigate("/user/progress")}
                >
                  Open logbook
                </button>
                <button
                  className="nb-btn-ghost py-2! px-3! text-sm"
                  onClick={() => navigate("/leaderboard")}
                >
                  Standings
                </button>
              </div>
            </div>
            <div className="nb-sheet p-6 flex flex-col justify-center">
              <h2 className="font-display font-bold">Field rates</h2>
              <dl className="nb-data text-sm mt-2 space-y-1">
                <div className="flex justify-between">
                  <dt className="text-soft">correct answer</dt>
                  <dd className="font-bold">+10 XP</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-soft">pass</dt>
                  <dd className="font-bold">+10 XP</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-soft">perfect run</dt>
                  <dd className="font-bold">+20 XP</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-soft">streak</dt>
                  <dd className="font-bold">up to +7 XP</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
        <div className="nb-sheet mt-6 overflow-hidden">
          <div className="px-5 pt-4 pb-3 flex items-baseline justify-between">
            <h2 className="font-display font-extrabold text-lg">
              {user.isAdmin ? "Published experiments" : "Experiments on the bench"}
            </h2>
            <span className="nb-data text-xs text-soft">
              {exams.length} entr{exams.length === 1 ? "y" : "ies"}
            </span>
          </div>
          {exams && exams.length > 0 ? (
            <ol>
              {exams.map((exam, index) => (
                <li
                  key={exam._id || index}
                  className="nb-row flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4"
                >
                  <span className="nb-data text-xs text-soft w-14 shrink-0">
                    EXP-{String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-[180px]">
                    <p className="font-display font-bold">{exam.name}</p>
                    <p className="mt-1">
                      <span className="nb-chip">{exam.category}</span>
                    </p>
                  </div>
                  <dl className="nb-data flex gap-5 text-xs text-soft">
                    <div>
                      <dt className="sr-only">Questions</dt>
                      <dd>
                        <span className="text-ink font-bold text-sm">
                          {exam.questions.length}
                        </span>{" "}
                        Q
                      </dd>
                    </div>
                    <div>
                      <dt className="sr-only">Marks</dt>
                      <dd>
                        <span className="text-ink font-bold text-sm">
                          {exam.totalMarks}
                        </span>{" "}
                        marks
                      </dd>
                    </div>
                    <div>
                      <dt className="sr-only">Duration</dt>
                      <dd>
                        <span className="text-ink font-bold text-sm">
                          {exam.duration}
                        </span>{" "}
                        min
                      </dd>
                    </div>
                  </dl>
                  {user.isAdmin ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="nb-btn py-2! px-4! text-sm"
                        onClick={() => navigate(`/user/write-exam/${exam._id}`)}
                      >
                        Begin run
                      </button>
                      <button
                        className="nb-btn-ghost py-2! px-3! text-sm"
                        onClick={() => navigate(`/admin/exams/edit/${exam._id}`)}
                      >
                        Open file
                      </button>
                    </div>
                  ) : (
                    <button
                      className="nb-btn py-2! px-4! text-sm"
                      onClick={() => navigate(`/user/write-exam/${exam._id}`)}
                    >
                      Begin run
                    </button>
                  )}
                </li>
              ))}
            </ol>
          ) : (
            <div className="px-5 py-12 text-center">
              <p className="font-display font-bold text-lg">Bench is empty</p>
              <p className="text-sm text-soft mt-1">
                {user.isAdmin
                  ? "File the first experiment to get the lab running."
                  : "No experiments filed yet — check back soon."}
              </p>
              {user.isAdmin && (
                <button
                  className="nb-btn mt-4"
                  onClick={() => navigate("/admin/exams/add")}
                >
                  File an experiment
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    )
  );
}

export default HomePage;
