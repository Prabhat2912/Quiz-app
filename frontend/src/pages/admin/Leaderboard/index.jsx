import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { message, Table } from "antd";
import { getLeaderboard, getAllReports } from "../../../apicalls/reports";
import { ShowLoading, HideLoading } from "../../../redux/loaderSlice";
import PageTitle from "../../../components/PageTitle";

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.users);

  // Fallback for backends that predate GET /api/reports/leaderboard
  // (e.g. a deployment made before the gamification APIs shipped):
  // rebuild the same rows from the legacy reports feed.
  const buildFromReports = (reports, currentUserId) => {
    const map = new Map();
    (reports || []).forEach((r) => {
      const u = r?.user;
      if (!u || u.isAdmin) return;
      const id = String(u._id);
      if (!map.has(id)) {
        map.set(id, {
          userId: u._id,
          name: u.name,
          level: u.level || 1,
          xp: u.xp || 0,
          badgesCount: (u.badges || []).length,
          badges: (u.badges || []).map((b) => ({ name: b.name, icon: b.icon })),
          totalQuizzes: 0,
          correct: 0,
          attempted: 0,
          currentStreak: u.stats?.currentStreak || 0,
        });
      }
      const entry = map.get(id);
      entry.totalQuizzes += 1;
      const c = r.result?.correctAnswers?.length || 0;
      const w = r.result?.wrongAnswers?.length || 0;
      entry.correct += c;
      entry.attempted += c + w;
    });
    const rows = [...map.values()].map((e) => ({
      userId: e.userId,
      name: e.name,
      level: e.level,
      xp: e.xp,
      badgesCount: e.badgesCount,
      badges: e.badges,
      totalQuizzes: e.totalQuizzes,
      accuracy:
        e.attempted > 0
          ? parseFloat(((e.correct / e.attempted) * 100).toFixed(1))
          : 0,
      currentStreak: e.currentStreak,
      isCurrentUser: String(e.userId) === String(currentUserId),
    }));
    rows.sort((a, b) => b.xp - a.xp || b.level - a.level);
    return rows.map((e, i) => ({ ...e, rank: i + 1 }));
  };

  const fetchLeaderboard = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getLeaderboard(50);
      if (response.success) {
        dispatch(HideLoading());
        setLeaderboard(response.data.leaderboard || []);
        setMyRank(response.data.myRank);
        return;
      }
      // New endpoint missing on this backend — fall back to reports feed.
      const legacy = await getAllReports();
      dispatch(HideLoading());
      if (legacy.success) {
        const rows = buildFromReports(legacy.data, user?._id);
        setLeaderboard(rows);
        setMyRank(rows.find((r) => r.isCurrentUser)?.rank || null);
      } else {
        message.error(legacy.message || response.message);
      }
    } catch (error) {
      dispatch(HideLoading());
      message.error(error.message);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const columns = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      render: (rank) =>
        rank === 1 ? "🥇 1" : rank === 2 ? "🥈 2" : rank === 3 ? "🥉 3" : rank,
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (name, record) =>
        user?.isAdmin ? (
          <button
            className={`hover:text-accent hover:underline text-left ${
              record.isCurrentUser ? "font-bold text-accent" : ""
            }`}
            onClick={() => navigate(`/admin/users/${record.userId}`)}
            title={`Open ${name}'s profile and logbook`}
          >
            {name} {record.isCurrentUser ? "(you)" : ""}
          </button>
        ) : (
          <span className={record.isCurrentUser ? "font-bold text-accent" : ""}>
            {name} {record.isCurrentUser ? "(you)" : ""}
          </span>
        ),
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      sorter: (a, b) => a.level - b.level,
      render: (level) => <span className="nb-chip nb-data">Lv {level}</span>,
    },
    {
      title: "XP",
      dataIndex: "xp",
      key: "xp",
      sorter: (a, b) => a.xp - b.xp,
      render: (xp) => <span className="nb-data font-bold text-accent">{xp} XP</span>,
    },
    {
      title: "Badges",
      dataIndex: "badgesCount",
      key: "badgesCount",
      sorter: (a, b) => a.badgesCount - b.badgesCount,
      render: (count, record) => (
        <span title={(record.badges || []).map((b) => b.name).join(", ")}>
          🏅 {count}
        </span>
      ),
    },
    {
      title: "Quizzes",
      dataIndex: "totalQuizzes",
      key: "totalQuizzes",
      sorter: (a, b) => a.totalQuizzes - b.totalQuizzes,
    },
    {
      title: "Accuracy",
      dataIndex: "accuracy",
      key: "accuracy",
      render: (acc) => `${acc}%`,
    },
    {
      title: "Streak",
      dataIndex: "currentStreak",
      key: "currentStreak",
      render: (s) => (s > 0 ? `🔥 ${s}` : "—"),
    },
  ];

  return (
    <div>
      <PageTitle title="Standings" sub="Ranked by total XP across all runs." />
      {myRank && (
        <div className="nb-specimen mb-3 p-3 text-sm">
          {user?.name}, you hold <b className="nb-data">#{myRank}</b> with{" "}
          <b className="nb-data">{user?.xp || 0} XP</b> (Level {user?.level || 1}).
        </div>
      )}
      <Table
        dataSource={leaderboard}
        columns={columns}
        className="min-w-[250px]"
        rowKey="userId"
        rowClassName={(record) =>
          record.isCurrentUser ? "nb-tint-accent font-semibold" : ""
        }
        pagination={{ pageSize: 20 }}
        locale={{ emptyText: "No leaderboard data available 😔" }}
      />
    </div>
  );
}

export default Leaderboard;
