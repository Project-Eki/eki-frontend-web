import axios from 'axios';

const api = axios.create({
  baseURL: "https://api-7w8f.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(request => {
  console.log('Sending Request to:', request.baseURL + (request.url || ''));
  return request;
});

export const signInUser = async (credentials) => {
  try {
    const response = await api.post('/api/v1/accounts/login/', {
      email: credentials.email?.trim().toLowerCase() || "",
      password: credentials.password
    });
    return response.data;
  } catch (error) {
    console.log("SIGNIN RAW ERROR:", error.response?.data); // 
    handleAxiosError(error);
  }
};

export const requestPasswordChange = async (email) => {
  try {
    const response = await api.post('/api/v1/accounts/password/change/', {
      email: email.trim().toLowerCase()
    });
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

const handleAxiosError = (error) => {
  const contentType = error.response?.headers['content-type'] || '';
  if (contentType.toLowerCase().includes('text/html')) {
    throw new Error("The server returned an invalid HTML page. Check if the API path is correct.");
  }

 
  if (error.response?.status === 500) {
    throw new Error("Account may have been created. Please check your email or try signing in.");
  }

  let message = "An error occurred. Please try again.";

  if (error.response?.data) {
    if (error.response.data.detail) message = error.response.data.detail;
    else if (error.response.data.message) message = error.response.data.message;
    else if (Array.isArray(error.response.data) && error.response.data[0]?.message) {
      message = error.response.data[0].message;
    }
  }

  if (!error.response) {
    message = "Network error: Unable to reach the server. Check your internet.";
  }

  throw new Error(message);
};

export default api;