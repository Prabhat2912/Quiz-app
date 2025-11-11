import axiosInstance from ".";

// Add a new exam
export const addExam = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/exams/addExam", payload);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Server error" };
    }
};

// Create exam using AI
export const createExamWithAI = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/exams/createExam", payload);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Server error" };
    }
};

// Fetch all exams
export const getAllExams = async () => {
    try {
        const response = await axiosInstance.get("/api/exams/getAllExams");
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Server error" };
    }
};

// Fetch single exam by ID
export const getExamById = async (id) => {
    try {
        const response = await axiosInstance.get(`/api/exams/getExamById/${id}`);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Server error" };
    }
};

// Edit an existing exam
export const editExam = async (payload, id) => {
    try {
        const response = await axiosInstance.put(`/api/exams/editExam/${id}`, payload);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Server error" };
    }
};

// Delete exam
export const deleteExam = async (id) => {
    try {
        const response = await axiosInstance.delete(`/api/exams/deleteExam/${id}`);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Server error" };
    }
};

// Add question to exam
export const addQuestionToExam = async (payload, id) => {
    try {
        const response = await axiosInstance.post(`/api/exams/addQuestionToExam/${id}`, payload);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Server error" };
    }
};

// Edit question in exam
export const editQuestionInExam = async (payload, id) => {
    try {
        const response = await axiosInstance.put(`/api/exams/editQuestionInExam/${id}`, payload);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Server error" };
    }
};

// Delete question from exam
export const deleteQuestionFromExam = async (id, payload) => {
    try {
        const response = await axiosInstance.delete(`/api/exams/deleteQuestionFromExam/${id}`, {
            data: payload,
        });
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Server error" };
    }
};

// Generate AI explanation for a question
export const generateExplanation = async (payload) => {
    try {
        const response = await axiosInstance.post("/api/exams/generateExplanation", payload);
        return response.data;
    } catch (error) {
        return error.response?.data || { success: false, message: "Server error" };
    }
};
