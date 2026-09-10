import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getUserProgress, getUserProgressById, getAllReports } from "../../../apicalls/reports";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import PageTitle from "../../../components/PageTitle";
import LevelProgressCard from "../../../components/gamification/LevelProgressCard";
import BadgeCard from "../../../components/gamification/BadgeCard";
import {
  LEVEL_BADGES,
  getLevelProgress,
  getNextLevelBadge,
} from "../../../utils/gamification";

/**
 * Admin inspection view: learner's profile + full logbook.
 * Route: /admin/users/:userId (linked from standings names).
 * Viewing your own id falls back to the self endpoint so it also
 * works against backends that predate the admin endpoint.
 */
function UserInspectionPage() {
  const { userId } = useParams();
  const { user: me } = useSelector((state) => state.users);
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [failMessage, setFailMessage] = useState("");
  const [reconstructed, setReconstructed] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Fallback for backends that predate the inspection endpoint:
  // rebuild the logbook from the legacy reports feed, which carries
  // the populated user doc (level, xp, badges, stats) on each attempt.
  const buildFromReports = (reports, targetId) => {
    const mine = (reports || []).filter(
      (r) => String(r?.user?._id || r?.user) === String(targetId)
    );
    if (mine.length === 0) return null;
    const u = mine[0].user;
    const totalQuizzes = u.stats?.totalQuizzesCompleted ?? mine.length;
    const totalCorrect = u.stats?.totalCorrectAnswers || 0;
    const totalAttempted = u.stats?.totalQuestionsAttempted || 0;
    const accuracy =
      totalAttempted > 0
        ? parseFloat(((totalCorrect / totalAttempted) * 100).toFixed(2))
        : 0;
    const level = u.level || 1;
    const xp = u.xp || 0;

    const recentScores = mine.slice(0, 10).map((report) => {
      const correct = report.result?.correctAnswers?.length || 0;
      const wrong = report.result?.wrongAnswers?.length || 0;
      const total = correct + wrong;
      return {
        examName: report.exam?.name || "Deleted Exam",
        category: report.exam?.category || "Unknown",
        score: correct,
        total,
        percentage:
          total > 0 ? parseFloat(((correct / total) * 100).toFixed(2)) : 0,
        date: report.createdAt,
        xpEarned: report.xpEarned || 0,
        verdict: report.result?.verdict || "—",
      };
    });

    const categoryPerformance = {};
    mine.forEach((report) => {
      const category = report.exam?.category || "Unknown";
      if (!categoryPerformance[category]) {
        categoryPerformance[category] = { attempted: 0, correct: 0, total: 0 };
      }
      const correct = report.result?.correctAnswers?.length || 0;
      const wrong = report.result?.wrongAnswers?.length || 0;
      categoryPerformance[category].attempted += 1;
      categoryPerformance[category].correct += correct;
      categoryPerformance[category].total += correct + wrong;
    });
    Object.values(categoryPerformance).forEach((s) => {
      s.averageScore =
        s.total > 0 ? parseFloat(((s.correct / s.total) * 100).toFixed(2)) : 0;
    });

    const earned = u.badges || [];
    const levelBadges = LEVEL_BADGES.map((b) => {
      const hit = earned.find((eb) => eb.name === b.name);
      return { ...b, earned: !!hit, earnedAt: hit?.earnedAt || null };
    });
    const achievementBadges = earned.filter(
      (b) => !LEVEL_BADGES.some((lb) => lb.name === b.name)
    );

    return {
      user: {
        name: u.name,
        email: u.email,
        level,
        xp,
        badges: earned,
        stats: {
          totalQuizzesCompleted: totalQuizzes,
          totalCorrectAnswers: totalCorrect,
          totalQuestionsAttempted: totalAttempted,
          perfectScores: u.stats?.perfectScores || 0,
          passedQuizzes: u.stats?.passedQuizzes || 0,
          currentStreak: u.stats?.currentStreak || 0,
          longestStreak: u.stats?.longestStreak || 0,
          lastQuizDate: u.stats?.lastQuizDate || null,
        },
      },
      stats: {
        totalQuizzesCompleted: totalQuizzes,
        accuracy,
        currentStreak: u.stats?.currentStreak || 0,
        longestStreak: u.stats?.longestStreak || 0,
        totalCorrectAnswers: totalCorrect,
        totalQuestionsAttempted: totalAttempted,
        perfectScores: u.stats?.perfectScores || 0,
        passedQuizzes: u.stats?.passedQuizzes || 0,
      },
      levelProgress: getLevelProgress(xp, level),
      nextBadge: getNextLevelBadge(level),
      levelBadges,
      achievementBadges,
      recentScores,
      categoryPerformance,
    };
  };

  useEffect(() => {
    const fetch = async () => {
      const isSelf = String(userId) === String(me?._id);
      // Learners never reach here through the UI (names aren't links for
      // them); stop direct-URL access early with a clear message.
      if (!isSelf && !me?.isAdmin) {
        dispatch(HideLoading());
        setFailMessage("Only admins can open other learners' logbooks.");
        setFailed(true);
        return;
      }
      try {
        dispatch(ShowLoading());
        const res = isSelf
          ? await getUserProgress()
          : await getUserProgressById(userId);
        if (res.success) {
          dispatch(HideLoading());
          setData(res.data);
          return;
        }
        // Inspection endpoint missing on this backend — reconstruct.
        const legacy = await getAllReports();
        dispatch(HideLoading());
        if (legacy.success) {
          const rebuilt = buildFromReports(legacy.data, userId);
          if (rebuilt) {
            setData(rebuilt);
            setReconstructed(true);
            return;
          }
          setFailMessage("No attempts on record for this learner.");
        } else {
          setFailMessage(legacy.message || res.message || "Could not open this logbook");
        }
        setFailed(true);
      } catch (e) {
        dispatch(HideLoading());
        setFailed(true);
        setFailMessage("Could not open this logbook");
      }
    };
    if (userId) fetch();
  }, [dispatch, userId, me?._id]);

  if (failed) {
    return (
      <div>
        <PageTitle title="Logbook unavailable" sub="This record could not be opened." />
        <div className="nb-sheet p-6 text-sm text-soft">
          {failMessage ||
            "The backend refused this request. Inspecting other learners needs an admin account."}
        </div>
        <button className="nb-btn-ghost mt-4" onClick={() => navigate("/leaderboard")}>
          Back to standings
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-64 text-soft">
        Opening logbook…
      </div>
    );
  }

  const { user, stats, recentScores, categoryPerformance } = data;
  const levelBadges = data.levelBadges || [];
  const achievementBadges = data.achievementBadges || [];

  return (
    <div>
      <PageTitle
        title={user.name}
        sub={`${user.email} · filed ${stats.totalQuizzesCompleted} runs${
          reconstructed ? " · reconstructed from reports feed" : ""
        }`}
      />

      <div className="nb-sheet p-6 flex items-center gap-4">
        <div
          className="w-16 h-16 rounded-full bg-accent text-white dark:text-[#06231a] flex items-center justify-center font-display font-extrabold text-2xl shrink-0"
          aria-hidden="true"
        >
          {user.name?.[0]?.toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="font-display font-extrabold text-xl truncate">{user.name}</h2>
          <p className="text-sm text-soft truncate">{user.email}</p>
          <p className="nb-data text-xs text-soft mt-1">
            Lv {user.level || 1} · {(user.xp || 0).toLocaleString()} XP ·{" "}
            {(user.badges || []).length} specimens · streak{" "}
            {user.stats?.currentStreak || 0}d (best {user.stats?.longestStreak || 0}d)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <LevelProgressCard xp={user.xp || 0} level={user.level || 1} />
        <section aria-label="Totals" className="nb-sheet p-6">
          <h3 className="font-display font-bold">Runs filed</h3>
          <p className="nb-data text-4xl font-bold mt-1">{stats.totalQuizzesCompleted}</p>
          <p className="nb-data text-xs text-soft mt-2">
            {stats.totalQuestionsAttempted} questions · {stats.perfectScores || 0} perfect ·{" "}
            {stats.passedQuizzes || 0} passed
          </p>
        </section>
        <section aria-label="Accuracy" className="nb-sheet p-6">
          <h3 className="font-display font-bold">Accuracy</h3>
          <p className="nb-data text-4xl font-bold mt-1">
            {Number(stats.accuracy || 0).toFixed(1)}
            <span className="text-base font-medium text-soft">%</span>
          </p>
          <p className="nb-data text-xs text-soft mt-2">
            {stats.totalCorrectAnswers} correct answers entered
          </p>
        </section>
      </div>

      <section aria-label="Badges" className="nb-sheet mt-4 p-6">
        <h3 className="font-display font-extrabold text-lg">Specimen cabinet</h3>
        <p className="nb-data text-xs text-soft mt-1 mb-4">
          {(user.badges || []).length} affixed
        </p>
        {levelBadges.length > 0 && (
          <>
            <h4 className="font-display font-bold text-sm mb-3">Level milestones</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {levelBadges.map((b) => (
                <BadgeCard key={b.name} badge={b} locked={!b.earned} />
              ))}
            </div>
          </>
        )}
        <h4 className="font-display font-bold text-sm mb-3">Field achievements</h4>
        {achievementBadges.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {achievementBadges.map((b, i) => (
              <BadgeCard
                key={b.name || i}
                badge={b}
                locked={!b.earned && !b.earnedAt}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-soft">Nothing affixed yet.</p>
        )}
      </section>

      <section aria-label="Recent runs" className="nb-sheet mt-4 p-6">
        <h3 className="font-display font-extrabold text-lg">Recent runs</h3>
        {(recentScores || []).length > 0 ? (
          <ol className="mt-2">
            {recentScores.map((score, index) => (
              <li key={index} className="nb-row flex justify-between items-center gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{score.examName}</p>
                  <p className="nb-data text-xs text-soft">
                    {new Date(score.date).toLocaleDateString()}
                    {score.xpEarned ? ` · +${score.xpEarned} XP` : ""}
                  </p>
                </div>
                <div className="text-right shrink-0 flex items-center gap-3">
                  <p className="nb-data text-lg font-bold">
                    {Number(score.percentage || 0).toFixed(0)}%
                  </p>
                  <span
                    className={`nb-stamp ${
                      score.verdict === "Pass" ? "nb-stamp-pass" : "nb-stamp-fail"
                    }`}
                  >
                    {score.verdict}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-soft mt-2">No runs on record.</p>
        )}
      </section>

      <section aria-label="Subjects" className="nb-sheet mt-4 p-6">
        <h3 className="font-display font-extrabold text-lg">Subject readings</h3>
        {categoryPerformance && Object.keys(categoryPerformance).length > 0 ? (
          <div className="space-y-4 mt-2">
            {Object.entries(categoryPerformance).map(([category, c]) => (
              <div key={category} className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <h4 className="font-display font-bold">{category}</h4>
                  <span className="nb-data text-xs text-soft">
                    {c.attempted} run{c.attempted !== 1 ? "s" : ""} ·{" "}
                    {Number(c.averageScore || 0).toFixed(0)}%
                  </span>
                </div>
                <div
                  className="nb-meter h-2.5"
                  role="progressbar"
                  aria-valuenow={Math.round(Number(c.averageScore) || 0)}
                  aria-valuemin="0"
                  aria-valuemax="100"
                  aria-label={`${category} average score`}
                >
                  <div style={{ "--fill": (Number(c.averageScore) || 0) / 100 }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-soft mt-2">No subject data.</p>
        )}
      </section>
    </div>
  );
}

export default UserInspectionPage;
