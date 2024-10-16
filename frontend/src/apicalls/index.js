import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: 'https://quiz-app-backend-lyart.vercel.app',
    headers: {
        'authorization': `Bearer ${localStorage.getItem('token')}`
    }
})

export default axiosInstance