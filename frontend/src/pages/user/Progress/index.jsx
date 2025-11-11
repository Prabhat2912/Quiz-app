import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { getUserProgress } from "../../../apicalls/reports";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import { message } from "antd";
import PageTitle from "../../../components/PageTitle";

function Progress() {
  const [progressData, setProgressData] = useState(null);
  const dispatch = useDispatch();

  const fetchProgressData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getUserProgress();
      dispatch(HideLoading());
      if (response.success) {
        setProgressData(response.data);
      } else {
        message.error(response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error("Failed to load progress data");
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, []);

  if (!progressData) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const { user, stats, levelProgress, recentScores, categoryPerformance } =
    progressData;
  const xpForNextLevel =
    levelProgress.xpForNextLevel - levelProgress.xpForCurrentLevel;
  const currentXpInLevel = user.xp - levelProgress.xpForCurrentLevel;
  const progressPercent = (currentXpInLevel / xpForNextLevel) * 100;

  return (
    <div className="p-4">
      <PageTitle title="Your Learning Progress" />

      {/* XP and Level Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Level Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 dark:from-purple-800 dark:to-purple-900 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2">Level {user.level}</h2>
          <p className="text-3xl font-bold">{user.xp} XP</p>
          <div className="mt-4">
            <div className="bg-purple-300 dark:bg-purple-950 rounded-full h-4 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-sm mt-2">
              {currentXpInLevel} / {xpForNextLevel} XP to Level {user.level + 1}
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-blue-500 dark:bg-blue-800 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2">Total Quizzes</h2>
          <p className="text-4xl font-bold">{stats.totalQuizzesCompleted}</p>
          <p className="text-sm mt-2">
            Questions: {stats.totalQuestionsAttempted}
          </p>
        </div>

        {/* Accuracy Card */}
        <div className="bg-green-500 dark:bg-green-800 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2">Accuracy</h2>
          <p className="text-4xl font-bold">{stats.accuracy.toFixed(1)}%</p>
          <p className="text-sm mt-2">Correct: {stats.totalCorrectAnswers}</p>
        </div>
      </div>

      {/* Streak Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <div className="bg-orange-500 dark:bg-orange-800 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2">🔥 Current Streak</h2>
          <p className="text-4xl font-bold">{user.stats.currentStreak} days</p>
          <p className="text-sm mt-2">Keep it going!</p>
        </div>

        <div className="bg-yellow-500 dark:bg-yellow-800 text-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold mb-2">🏆 Longest Streak</h2>
          <p className="text-4xl font-bold">{user.stats.longestStreak} days</p>
          <p className="text-sm mt-2">Personal best!</p>
        </div>
      </div>

      {/* Badges Section */}
      {user.badges && user.badges.length > 0 && (
        <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold mb-4">🏅 Your Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {user.badges.map((badge, index) => (
              <div
                key={index}
                className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                <span className="text-4xl mb-2">{badge.icon || "🏆"}</span>
                <h3 className="font-bold text-center">{badge.name}</h3>
                <p className="text-xs text-center text-gray-600 dark:text-gray-300 mt-1">
                  {new Date(badge.earnedAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Scores */}
      <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">📊 Recent Scores</h2>
        {recentScores.length > 0 ? (
          <div className="space-y-2">
            {recentScores.map((score, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-3 bg-gray-100 dark:bg-gray-700 rounded"
              >
                <div>
                  <p className="font-semibold">{score.examName}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {new Date(score.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">
                    {score.percentage.toFixed(0)}%
                  </p>
                  <p
                    className={`text-sm ${
                      score.verdict === "Pass"
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {score.verdict}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No quiz attempts yet. Start learning!
          </p>
        )}
      </div>

      {/* Category Performance */}
      <div className="mt-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">📚 Category Performance</h2>
        {categoryPerformance && Object.keys(categoryPerformance).length > 0 ? (
          <div className="space-y-4">
            {Object.entries(categoryPerformance).map(([category, data]) => (
              <div key={category} className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-lg">{category}</h3>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {data.attempted} quiz{data.attempted !== 1 ? "zes" : ""}
                  </span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full flex items-center justify-center text-white text-sm font-medium rounded-full transition-all duration-500"
                    style={{ width: `${data.averageScore}%` }}
                  >
                    {data.averageScore.toFixed(0)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">
            No category data yet. Take some quizzes!
          </p>
        )}
      </div>
    </div>
  );
}

export default Progress;
