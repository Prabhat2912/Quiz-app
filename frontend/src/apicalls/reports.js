import axiosInstance from ".";

export const addReport = async (payload) => {
    try {
        const response = await axiosInstance.post('/api/reports/addReport', payload)
        return response.data
    }
    catch (error) {
        return error.response.data
    }
}

export const getAllAttempts = async (payload) => {
    try {
        const response = await axiosInstance.post('/api/reports/getAllAttempts', payload)
        return response.data
    }
    catch (error) {
        return error.response.data
    }
}

export const getAllReports = async () => {
    try {
        const response = await axiosInstance.get('/api/reports/getAllReports')
        return response.data
    }
    catch (error) {
        return error.response.data
    }
}


export const getAllAttemptsByUser = async () => {
    try {
        const response = await axiosInstance.get('/api/reports/getAllAttemptsByUser')
        return response.data
    }
    catch (error) {
        return error.response.data
    }
}

export const getUserProgress = async () => {
    try {
        const response = await axiosInstance.get('/api/reports/getUserProgress')
        return response.data
    }
    catch (error) {
        return error.response.data
    }
}

export const getUserProgressById = async (userId) => {
    try {
        const response = await axiosInstance.get(`/api/reports/admin/user-progress/${userId}`)
        return response.data
    }
    catch (error) {
        return error.response.data
    }
}
export const getReportById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/reports/report/${id}`)
        return response.data
    }
    catch (error) {
        return error.response.data
    }
}
export const getLeaderboard = async (limit = 50) => {
    try {
        const response = await axiosInstance.get(`/api/reports/leaderboard?limit=${limit}`)
        return response.data
    }
    catch (error) {
        return error.response.data
    }
}

export const getBadgeCatalog = async () => {
    try {
        const response = await axiosInstance.get('/api/reports/badges')
        return response.data
    }
    catch (error) {
        return error.response.data
    }
}

export const getXPHistory = async (limit = 20) => {
    try {
        const response = await axiosInstance.get(`/api/reports/xp-history?limit=${limit}`)
        return response.data
    }
    catch (error) {
        return error.response.data
    }
}
