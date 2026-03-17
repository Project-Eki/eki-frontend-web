import axios from 'axios';

const api = axios.create({
  // FIX: Switched from Render to your local Django server
  baseURL: "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(request => {
  console.log('Sending Request to:', request.baseURL + (request.url || ''));
  return request;
});

// Sign In (Note: File name is sign in, path matches Django)
export const signInUser = async (credentials) => {
  try {
    // FIX: Updated path to /api/v1/accounts/login/
    const response = await api.post('/api/v1/accounts/login/', {
      email: credentials.email?.trim().toLowerCase() || "",
      password: credentials.password
    });
    return response.data;
  } catch (error) {
    console.log("SIGNIN RAW ERROR:", error.response?.data); 
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
    throw new Error("Server error. Please check your Django terminal for logs.");
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
    message = "Network error: Unable to reach your local server. Is Django running?";
  }

  throw new Error(message);
};

export default api;