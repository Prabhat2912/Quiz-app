import React, { useEffect, useState } from 'react'
import { getUserInfo } from '../apicalls/users'
import { message } from 'antd'
import { useDispatch } from 'react-redux'
import { SetUser } from '../redux/usersSlice'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { HideLoading, ShowLoading } from '../redux/loaderSlice'

function ProtectedRoute({ children }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(state => state.users.user)
  const [menu, setMenu] = useState([]);
  const [collapsed, setCollapsed] = useState(false);
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
      dispatch(ShowLoading())
      const response = await getUserInfo()
      dispatch(HideLoading())
      if (response.success) {
        message.success(response.message)
        dispatch(SetUser(response.data))
        if (response.data.isAdmin) {
          setMenu(adminMenu)
        }
        else {
          setMenu(userMenu)
        }
      }
      else {
        dispatch(HideLoading())
        message.error(response.message)
      }
    }
    catch (error) {
      message.error(error.message)
      navigate("/login")
    }
  }
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
    user && <div className=' border h-[100%] '>
      <div className='flex  '>
        <div className={`sidebar ${collapsed ? "w-20" : "w-64"} transition-all duration-300 ease-linear border-r border-gray-400  p-2.5  text-white h-[100vh]    flex flex-col items-center justify-start`}>

          <div className={` ${collapsed ? "justify-center" : "justify-end"} cursor-pointer items-end w-full flex  `}>
            {!collapsed && <i className="ri-close-line text-2xl flex items-center"
              onClick={() => setCollapsed(true)}></i>}
            {collapsed && <i className="ri-menu-2-line text-2xl flex items-center" onClick={() => setCollapsed(false)}></i>}
          </div>
          <div className='flex justify-center flex-col gap-1  mt-8'>
            {menu.map((item, index) => {
              return (
                <div className={`flex items-center p-2 justify-end gap-4 m-1  cursor-pointer transition-all duration-50 ease-in-out ${getIsActiveOrNot(item.paths) && "px-4 py-3 border-2 border-white  rounded-md"}`} key={index} onClick={item.onClick}>
                  {item.icon}
                  {!collapsed && <span>{item.title}</span>}
                </div>
              )
            })}
          </div>
        </div>
        <div className='w-full'>
          <div className='header flex justify-between'>

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
          </div>
          <div className='p-4 overflow-y-auto bg-gray-200 h-full '>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProtectedRoute