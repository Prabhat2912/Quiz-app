import axiosInstance from ".";

const safeError = (error, fallback) => {
  const d = error?.response?.data;
  // A deployed backend that predates an endpoint answers with an HTML 404
  // page instead of JSON — translate that into an actionable message.
  if (d && typeof d === "object" && d.message) return d;
  return {
    success: false,
    message: `${fallback} If this keeps happening, the deployed backend needs a redeploy.`,
  };
};

export const registerUser = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/users/register', payload);
    return response.data
  }
  catch (error) {
    return safeError(error, "Registration failed.");
  }
}

export const loginUser = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/users/login', payload);
    return response.data
  }
  catch (error) {
    return safeError(error, "Login failed.");
  }
}

export const getUserInfo = async () => {
  try {
    const response = await axiosInstance.post('/api/users/get-user-info')

    return response.data

  }
  catch (error) {
    return error.response.data
  }
}

export const sendVerificationOtp = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/users/send-verification-otp', payload);
    return response.data
  }
  catch (error) {
    return safeError(error, "Could not send code.");
  }
}

export const verifyEmail = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/users/verify-email', payload);
    return response.data
  }
  catch (error) {
    return safeError(error, "Could not verify code.");
  }
}

export const forgotPassword = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/users/forgot-password', payload);
    return response.data
  }
  catch (error) {
    return safeError(error, "Could not start password reset.");
  }
}

export const verifyResetOtp = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/users/verify-reset-otp', payload);
    return response.data
  }
  catch (error) {
    return safeError(error, "Could not verify code.");
  }
}

export const resetPassword = async (payload) => {
  try {
    const response = await axiosInstance.post('/api/users/reset-password', payload);
    return response.data
  }
  catch (error) {
    return safeError(error, "Could not reset password.");
  }
}