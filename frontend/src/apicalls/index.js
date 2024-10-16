import axios from 'axios'

const axiosInstance = axios.create({
    baseURL: 'https://quiz-app-backend-theta.vercel.app/',
    headers: {
        'authorization': `Bearer ${localStorage.getItem('token')}`
    }
})

export default axiosInstance