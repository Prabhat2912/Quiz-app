import React from 'react'
import { Form, message } from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { registerUser } from '../../../apicalls/users'
import { useDispatch } from 'react-redux'
import { HideLoading, ShowLoading } from '../../../redux/loaderSlice'

function RegisterPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      return message.error('Passwords do not match')
    }

    try {
      dispatch(ShowLoading())
      const response = await registerUser(values)
      dispatch(HideLoading())
      if (response.success) {
        message.success(response.message)
        navigate('/login')
      } else {
        message.error(response.message)
      }
    } catch (error) {
      dispatch(HideLoading())
      message.error(error.message)
    }
  }

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-primary">
      <div className="card w-400 p-3 bg-white">
        <div className="flex flex-col">
          <h1 className="text-2xl">
            Quiz App Register <i className="ri-user-add-line"></i>
          </h1>
          <div className="divider"></div>
          <Form layout="vertical" className="mt-2" onFinish={onFinish} initialValues={{ isAdmin: false }} >
            <Form.Item
              name="name"
              label="Name"
              rules={[{ required: true, message: 'Please enter your name' }]}
            >
              <input type="text" placeholder="Enter your name" />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: 'Please enter your email' }]}
            >
              <input type="email" placeholder="Enter your email" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <input type="password" placeholder="Enter your password" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              rules={[
                { required: true, message: 'Please confirm your password' },
              ]}
            >
              <input type="password" placeholder="Confirm your password" />
            </Form.Item>

            <Form.Item
              name="isAdmin"
              label="Are you Admin?"
              rules={[{ required: true, message: 'Please select admin status' }]}
            >
              <select>
                <option value={false}>No</option>
                <option value={true}>Yes</option>
              </select>
            </Form.Item>

            <div className="flex flex-col gap-2">
              <button type="submit" className="primary-contained-btn dark:bg-black dark:border-black  dark:hover:text-black dark:hover:border-black transition-all duration-200 ease-linear rounded-md cursor-pointer mt-2 w-100">
                Register
              </button>
              <Link to="/login">Already have an account? Login Here</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
