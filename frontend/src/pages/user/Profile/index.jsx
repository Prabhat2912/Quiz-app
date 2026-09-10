import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { getUserProgress } from "../../../apicalls/reports";
import { HideLoading, ShowLoading } from "../../../redux/loaderSlice";
import PageTitle from "../../../components/PageTitle";
import LevelProgressCard from "../../../components/gamification/LevelProgressCard";
import BadgeCard from "../../../components/gamification/BadgeCard";

function ProfilePage() {
  const { user } = useSelector((state) => state.users);
  const [progress, setProgress] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        dispatch(ShowLoading());
        const res = await getUserProgress();
        dispatch(HideLoading());
        if (res.success) setProgress(res.data);
        else message.error(res.message);
      } catch (e) {
        dispatch(HideLoading());
        message.error("Failed to load profile");
      }
    };
    fetch();
  }, [dispatch]);

  if (!user) return null;

  const badges = progress?.user?.badges || user.badges || [];
  const levelBadges = progress?.levelBadges || [];
  const achievementBadges = progress?.achievementBadges || [];

  return (
    <div className="max-w-4xl mx-auto">
      <PageTitle title="Profile" sub="The researcher behind the runs." />
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
            {badges.length} specimens · {user.isAdmin ? "Admin" : "Learner"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <LevelProgressCard xp={user.xp || 0} level={user.level || 1} />
        <section aria-label="Stats" className="nb-sheet p-6">
          <h3 className="font-display font-bold">Readings</h3>
          <dl className="nb-data grid grid-cols-2 gap-2 text-sm mt-2">
            <div className="flex justify-between border-b border-rule pb-1">
              <dt className="text-soft">runs</dt>
              <dd className="font-bold">{progress?.stats?.totalQuizzesCompleted ?? "—"}</dd>
            </div>
            <div className="flex justify-between border-b border-rule pb-1">
              <dt className="text-soft">accuracy</dt>
              <dd className="font-bold">{progress?.stats?.accuracy ?? "—"}%</dd>
            </div>
            <div className="flex justify-between border-b border-rule pb-1">
              <dt className="text-soft">perfect</dt>
              <dd className="font-bold">{progress?.stats?.perfectScores ?? "—"}</dd>
            </div>
            <div className="flex justify-between border-b border-rule pb-1">
              <dt className="text-soft">passed</dt>
              <dd className="font-bold">{progress?.stats?.passedQuizzes ?? "—"}</dd>
            </div>
            <div className="flex justify-between border-b border-rule pb-1">
              <dt className="text-soft">streak</dt>
              <dd className="font-bold">{progress?.stats?.currentStreak ?? "—"}d</dd>
            </div>
            <div className="flex justify-between border-b border-rule pb-1">
              <dt className="text-soft">best</dt>
              <dd className="font-bold">{progress?.stats?.longestStreak ?? "—"}d</dd>
            </div>
          </dl>
          <button
            className="nb-btn py-2! px-3! text-sm mt-4"
            onClick={() => navigate("/user/progress")}
          >
            Open logbook
          </button>
        </section>
      </div>

      {badges.length > 0 ? (
        <section aria-label="Badge showcase" className="nb-sheet mt-4 p-6">
          <h3 className="font-display font-bold">Cabinet highlights ({badges.length})</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {badges.slice(0, 8).map((b, i) => (
              <BadgeCard key={b.name || i} badge={{ ...b, earned: true }} />
            ))}
          </div>
          {(levelBadges.length > 0 || achievementBadges.length > 0) && (
            <button
              className="mt-3 text-sm text-accent font-semibold hover:underline"
              onClick={() => navigate("/user/progress")}
            >
              Full cabinet →
            </button>
          )}
        </section>
      ) : (
        <div className="nb-sheet mt-4 p-6 text-sm text-soft">
          Cabinet empty — file a run to affix the first specimen.
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
