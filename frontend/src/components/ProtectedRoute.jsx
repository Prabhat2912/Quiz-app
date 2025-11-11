import React, { useEffect, useState, useCallback, useMemo } from "react";
import { getUserInfo } from "../apicalls/users";
import { message } from "antd";
import { useDispatch } from "react-redux";
import { SetUser } from "../redux/usersSlice";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { HideLoading, ShowLoading } from "../redux/loaderSlice";
import ThemeBtn from "./ThemeBtn";
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
        title: "Progress",
        paths: ["/user/progress"],
        icon: <i className="ri-line-chart-line"></i>,
        onClick: () => navigate("/user/progress"),
      },
      {
        title: "Reports",
        paths: ["/user/reports"],
        icon: <i className="ri-bar-chart-line"></i>,
        onClick: () => navigate("/user/reports"),
      },
      {
        title: "Logout",
        paths: ["/logout"],
        icon: <i className="ri-logout-box-line"></i>,
        onClick: () => {
          localStorage.removeItem("token");
          navigate("/login");
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
          navigate("/login");
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
        console.log("User data received:", response.data); // Debug log
        console.log("User XP:", response.data.xp);
        console.log("User Level:", response.data.level);
        console.log("User Badges:", response.data.badges);
        message.success(response.message);
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

  // Debug logging
  if (user) {
    console.log("Rendering with user:", user);
    console.log("User level:", user.level);
    console.log("User xp:", user.xp);
    console.log("Is admin?", user.isAdmin);
  }

  return (
    user && (
      <div className="  h-[100vh] min-w-[340px] overflow-hidden ">
        <div className="flex h-[100%]  ">
          <div
            className={` ${
              collapsed ? "w-20" : "w-64"
            } mt-[55px] bg-[#0F3460] z-[10000] dark:bg-black overflow-hidden transition-all duration-200 ease-linear   p-2.5  text-white h-[100vh]   flex flex-col items-center justify-start`}
          >
            <div
              className={` ${
                collapsed ? "justify-center" : "justify-end"
              } cursor-pointer items-end w-full flex  `}
            >
              {!collapsed && (
                <i
                  className="ri-close-line text-2xl flex items-center"
                  onClick={() => setCollapsed(true)}
                ></i>
              )}
              {collapsed && (
                <i
                  className="ri-menu-2-line text-2xl flex items-center"
                  onClick={() => setCollapsed(false)}
                ></i>
              )}
            </div>
            <div className="flex justify-center  flex-col gap-1  mt-8">
              {menu.map((item, index) => {
                return (
                  <div
                    className={`flex items-center p-2 justify-center gap-4 m-1  cursor-pointer transition-all duration-50 ease-in-out ${
                      getIsActiveOrNot(item.paths) &&
                      "px-4 py-3 border-2 border-white  rounded-md"
                    }`}
                    key={index}
                    onClick={item.onClick}
                  >
                    {item.icon}
                    {!collapsed && (
                      <div className="  min-w-20 ">{item.title}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="w-full overflow-y-scroll">
            <div className=" w-full fixed top-0 px-4  z-[10000] right-0 p-1.5 text-white bg-[#0F3460] transition-all duration-200 ease-linear dark:bg-black flex justify-between items-center">
              <h1 className="text-2xl text-white flex items-center">
                Quiz App
              </h1>

              {/* XP and Level Display - Show for all users */}
              {user && (user.level !== undefined || user.xp !== undefined) ? (
                <div className="flex items-center gap-4">
                  <div className="flex flex-col items-center">
                    <span className="text-xs opacity-80">Level</span>
                    <span className="text-lg font-bold">{user.level || 1}</span>
                  </div>
                  <div className="flex flex-col min-w-[120px]">
                    <div className="flex justify-between text-xs mb-1">
                      <span>{user.xp || 0} XP</span>
                      {user.badges && user.badges.length > 0 && (
                        <span>🏅 {user.badges.length}</span>
                      )}
                    </div>
                    <div className="bg-gray-600 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-yellow-400 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            (((user.xp || 0) % 100) / 100) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : null}

              <div>
                <div className="flex justify-center items-center gap-1">
                  <i className="ri-user-line"></i>
                  {user?.name}
                </div>
                <span className="text-sm opacity-80">
                  Role : {user?.isAdmin ? "Admin" : "User"}
                </span>
              </div>
              <div className="flex justify-center items-center">
                <ThemeBtn />
              </div>
            </div>
            <div className=" overflow-y-scroll p-4 mt-8 bg-gray-200 min-h-full ">
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default ProtectedRoute;
