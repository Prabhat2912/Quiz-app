import React, { useEffect, useState } from 'react'
import { getUserInfo } from '../apicalls/users'
import { message } from 'antd'
import { useDispatch } from 'react-redux'
import { SetUser } from '../redux/usersSlice'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { HideLoading, ShowLoading } from '../redux/loaderSlice'
import ThemeBtn from './ThemeBtn'


function ProtectedRoute({ children }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(state => state.users.user)
  const [menu, setMenu] = useState([]);
  const [collapsed, setCollapsed] = useState(true);
  const userMenu = [
    {
      title: "Home",
      paths: ["/", "/user/write-exam/:id"],
      icon: <i className="ri-home-line"></i>,
      onClick: () => navigate("/")
    },
    {
      title: "Reports",
      paths: ["/user/reports"],
      icon: <i className="ri-bar-chart-line"></i>,
      onClick: () => navigate("/user/reports")
    },
    // {
    //   title: "Profile",
    //   paths: ["/profile"],
    //   icon: <i className='ri-user-line'></i>,
    //   onClick: ()=>navigate("/profile")
    // },
    {
      title: "Logout",
      paths: ["/logout"],
      icon: <i className='ri-logout-box-line'></i>,
      onClick: () => {
        localStorage.removeItem("token")
        navigate("/login");
      }
    }
  ]
  const adminMenu = [
    {
      title: "Home",
      paths: ["/", "/user/write-exam/:id"],
      icon: <i className="ri-home-line"></i>,
      onClick: () => navigate("/")
    },
    {
      title: "Exams",
      paths: ["/admin/exams", "/admin/exams/add", "/admin/exams/edit/:id"],
      icon: <i className='ri-file-list-line'></i>,
      onClick: () => navigate("/admin/exams")
    },
    {
      title: "Reports",
      paths: ["/admin/reports"],
      icon: <i className="ri-bar-chart-line"></i>,
      onClick: () => navigate("/admin/reports")
    },
    {
      title: "Leaderboard",
      paths: ["/leaderboard"],
      icon: <i className='ri-trophy-line'></i>,
      onClick: () => navigate("/leaderboard")
    },
    {
      title: "Logout",
      paths: ["/logout"],
      icon: <i className='ri-logout-box-line'></i>,
      onClick: () => {
        localStorage.removeItem("token")
        navigate("/login");
      }
    }
  ]
  const getUserData = async () => {
    try {
      dispatch(ShowLoading());
      const response = await getUserInfo();
      dispatch(HideLoading());

      if (response.success) {
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
  };

  useEffect(() => {
    if (localStorage.getItem('token')) {
      if (!user) {
        getUserData();
      }
    }
    else {
      navigate('/login');
    }
  }, [])
  const activeRoute = window.location.pathname;
  const getIsActiveOrNot = (paths) => {
    if (paths.includes(activeRoute)) {
      return true;
    }
    else {
      if (activeRoute.includes("/admin/exams/edit") && paths.includes("/admin/exams")) {
        return true
      }
      if (activeRoute.includes("/user/write-exam/:id") && paths.includes("/user/write-exam/:id")) {
        return true
      }
      return false;
    }
  }
  return (
    user && <div className=' border h-[100vh] min-w-[340px] overflow-hidden '>
      <div className='flex h-[100%]   '>
        <div className={` ${collapsed ? "w-20" : "w-64"} mt-[56px] bg-[#0F3460] dark:bg-black overflow-hidden transition-all duration-200 ease-linear border-r border-gray-400  p-2.5  text-white h-[100vh]  flex flex-col items-center justify-start`}>

          <div className={` ${collapsed ? "justify-center" : "justify-end"} cursor-pointer items-end w-full flex  `}>
            {!collapsed && <i className="ri-close-line text-2xl flex items-center"
              onClick={() => setCollapsed(true)}></i>}
            {collapsed && <i className="ri-menu-2-line text-2xl flex items-center" onClick={() => setCollapsed(false)}></i>}
          </div>
          <div className='flex justify-center flex-col gap-1  mt-8'>
            {menu.map((item, index) => {
              return (
                <div className={`flex items-center p-2 justify-center gap-4 m-1  cursor-pointer transition-all duration-50 ease-in-out ${getIsActiveOrNot(item.paths) && "px-4 py-3 border-2 border-white  rounded-md"}`} key={index} onClick={item.onClick}>
                  {item.icon}
                  {!collapsed && <div className='  min-w-20 '>{item.title}</div>}
                </div>
              )
            })}
          </div>
        </div>
        <div className='w-full overflow-y-scroll'>
          <div className=' w-full fixed top-0   z-[10000] right-0 p-1.5 text-white bg-[#0F3460] transition-all duration-200 ease-linear dark:bg-black flex justify-between'>

            <h1 className='text-2xl text-white flex items-center'>
              Quiz App
            </h1>
            <div>
              <div className='flex justify-center items-center gap-1'>
                <i className="ri-user-line"></i>
                {user?.name}
              </div>
              <span>Role : {(user?.isAdmin) ? "Admin" : "User"}</span>
            </div>
            <div className='flex justify-center items-center' >
              <ThemeBtn />
            </div>
          </div>
          <div className=' overflow-y-scroll p-4 mt-8 bg-gray-200 min-h-full '>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProtectedRoute