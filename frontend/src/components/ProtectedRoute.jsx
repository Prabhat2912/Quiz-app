import React, { useEffect, useState, useCallback, useMemo } from "react";
import { getUserInfo } from "../apicalls/users";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { SetUser } from "../redux/usersSlice";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { HideLoading, ShowLoading } from "../redux/loaderSlice";
import ThemeBtn from "./ThemeBtn";
import LevelProgressCard from "./gamification/LevelProgressCard";
import "remixicon/fonts/remixicon.css";

function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.users.user);
  const [menu, setMenu] = useState([]);
  const [collapsed, setCollapsed] = useState(true);
  const userMenu = useMemo(
    () => [
      {
        title: "Home",
        paths: ["/", "/user/write-exam/:id"],
        icon: <i className="ri-home-line"></i>,
        onClick: () => navigate("/"),
      },
      {
        title: "Logbook",
        paths: ["/user/progress"],
        icon: <i className="ri-book-open-line"></i>,
        onClick: () => navigate("/user/progress"),
      },
      {
        title: "Reports",
        paths: ["/user/reports"],
        icon: <i className="ri-bar-chart-line"></i>,
        onClick: () => navigate("/user/reports"),
      },
      {
        title: "Leaderboard",
        paths: ["/leaderboard"],
        icon: <i className="ri-trophy-line"></i>,
        onClick: () => navigate("/leaderboard"),
      },
      {
        title: "Logout",
        paths: ["/logout"],
        icon: <i className="ri-logout-box-line"></i>,
        onClick: () => {
          localStorage.removeItem("token");
          window.location.href = "/";
        },
      },
    ],
    [navigate]
  );

  const adminMenu = useMemo(
    () => [
      {
        title: "Home",
        paths: ["/", "/user/write-exam/:id"],
        icon: <i className="ri-home-line"></i>,
        onClick: () => navigate("/"),
      },
      {
        title: "Exams",
        paths: ["/admin/exams", "/admin/exams/add", "/admin/exams/edit/:id"],
        icon: <i className="ri-file-list-line"></i>,
        onClick: () => navigate("/admin/exams"),
      },
      {
        title: "Reports",
        paths: ["/admin/reports"],
        icon: <i className="ri-bar-chart-line"></i>,
        onClick: () => navigate("/admin/reports"),
      },
      {
        title: "Logbook",
        paths: ["/user/progress"],
        icon: <i className="ri-book-open-line"></i>,
        onClick: () => navigate("/user/progress"),
      },
      {
        title: "Leaderboard",
        paths: ["/leaderboard"],
        icon: <i className="ri-trophy-line"></i>,
        onClick: () => navigate("/leaderboard"),
      },
      {
        title: "Logout",
        paths: ["/logout"],
        icon: <i className="ri-logout-box-line"></i>,
        onClick: () => {
          localStorage.removeItem("token");
          window.location.href = "/";
        },
      },
    ],
    [navigate]
  );
  const getUserData = useCallback(async () => {
    try {
      dispatch(ShowLoading());
      const response = await getUserInfo();
      dispatch(HideLoading());

      if (response.success) {
        dispatch(SetUser(response.data));
        if (response.data.isAdmin) {
          setMenu(adminMenu);
        } else {
          setMenu(userMenu);
        }
      } else {
        if (response.message === "jwt expired") {
          message.error("Session expired. Please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
        } else {
          message.error(response.message);
        }
      }
    } catch (error) {
      message.error("An error occurred. Redirecting to login.");
      localStorage.removeItem("token");
      navigate("/login");
    }
  }, [dispatch, navigate, adminMenu, userMenu]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      if (!user) {
        getUserData();
      }
    } else {
      navigate("/login");
    }
  }, [location.pathname, getUserData, navigate, user]);
  const activeRoute = window.location.pathname;
  const getIsActiveOrNot = (paths) => {
    if (paths.includes(activeRoute)) {
      return true;
    } else {
      if (
        activeRoute.includes("/admin/exams/edit") &&
        paths.includes("/admin/exams")
      ) {
        return true;
      }
      if (
        activeRoute.includes("/user/write-exam/:id") &&
        paths.includes("/user/write-exam/:id")
      ) {
        return true;
      }
      return false;
    }
  };

  return (
    user && (
      <div className="h-screen min-w-[340px] overflow-hidden bg-paper text-ink">
        <div className="flex h-full">
          <nav
            aria-label="Primary"
            className={`${
              collapsed ? "w-[76px]" : "w-60"
            } mt-14 shrink-0 z-10 overflow-hidden transition-all duration-200 ease-linear p-3 h-[calc(100vh-56px)] flex flex-col items-stretch bg-sheet border-r border-rule`}
          >
            <button
              className="cursor-pointer flex items-center text-soft hover:text-accent self-end p-1"
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "Expand navigation" : "Collapse navigation"}
              aria-expanded={!collapsed}
            >
              <i
                className={`${
                  collapsed ? "ri-menu-2-line" : "ri-close-line"
                } text-xl`}
              ></i>
            </button>
            <div className="flex flex-col gap-1 mt-6">
              {menu.map((item, index) => {
                const active = getIsActiveOrNot(item.paths);
                return (
                  <button
                    key={index}
                    onClick={item.onClick}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors duration-150 text-left ${
                      collapsed ? "justify-center" : ""
                    } ${
                      active
                        ? "bg-accent text-white dark:text-[#06231a] font-semibold"
                        : "text-soft hover:text-accent nb-hover-tint"
                    }`}
                  >
                    <span className="text-lg leading-none">{item.icon}</span>
                    {!collapsed && (
                      <span className="text-sm">
                        <span className="nb-data opacity-60 mr-2">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        {item.title}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {!collapsed && user && (
              <div className="mt-auto pt-4">
                <div className="divider mb-3"></div>
                <div className="px-1">
                  <LevelProgressCard
                    xp={user.xp || 0}
                    level={user.level || 1}
                    compact
                  />
                </div>
              </div>
            )}
          </nav>
          <div className="flex-1 min-w-0 overflow-y-auto">
            <header className="w-full fixed top-0 right-0 z-10 h-14 px-4 bg-sheet border-b border-rule flex justify-between items-center gap-3">
              <button
                className="flex items-baseline gap-2 cursor-pointer"
                onClick={() => navigate("/")}
                aria-label="Quiz App home"
              >
                <span className="font-display font-extrabold text-lg tracking-tight">
                  Quiz App
                </span>
                <span className="nb-data hidden sm:inline text-xs text-soft">
                  lab notebook ·{" "}
                  {user?.isAdmin ? "author bench" : "experiment log"}
                </span>
              </button>

              <div className="flex items-center gap-3">
                {!user?.isAdmin &&
                  (user.level !== undefined || user.xp !== undefined) && (
                    <div className="hidden md:flex items-center gap-2">
                      <span className="nb-data text-sm font-semibold">
                        Lv {user.level || 1}
                      </span>
                      <span className="nb-data text-xs text-soft">
                        {(user.xp || 0).toLocaleString()} XP
                      </span>
                      {user.badges && user.badges.length > 0 && (
                        <span
                          className="nb-data text-xs font-semibold text-accent"
                          title="Badges earned"
                        >
                          ⬢ {user.badges.length}
                        </span>
                      )}
                    </div>
                  )}
                <button
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => navigate("/profile")}
                  aria-label="Open profile"
                >
                  <span
                    className="w-8 h-8 rounded-full bg-accent text-white dark:text-[#06231a] flex items-center justify-center font-display font-bold text-sm"
                    aria-hidden="true"
                  >
                    {user?.name?.[0]?.toUpperCase()}
                  </span>
                  <span className="hidden sm:block text-left leading-tight">
                    <span className="block text-sm font-semibold">
                      {user?.name}
                    </span>
                    <span className="block text-xs text-soft">
                      {user?.isAdmin ? "Admin" : "Learner"}
                    </span>
                  </span>
                </button>
                <ThemeBtn />
              </div>
            </header>
            <main className="nb-page p-4 sm:p-6 mt-14 min-h-[calc(100vh-56px)]">
              <div className="max-w-6xl mx-auto">{children}</div>
            </main>
          </div>
        </div>
      </div>
    )
  );
}

export default ProtectedRoute;
