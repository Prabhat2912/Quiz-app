import axios from 'axios'

// Local override for development: create frontend/.env containing
//   VITE_API_URL=http://localhost:8000
// and restart vite to talk to a local backend instead of production.
// (Do not commit that file if the frontend itself deploys from this repo.)
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://quiz-app-backend-lyart.vercel.app',
    headers: {
        'authorization': `Bearer ${localStorage.getItem('token')}`
    }
})

export default axiosInstance

if (import.meta.env.DEV) {
    // Visible in DevTools console so a miswired backend target is obvious.
    console.info(`[api] backend target: ${axiosInstance.defaults.baseURL}`);
}
