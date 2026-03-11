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
    const response = await api.post('/api/v1/accounts/signin/', {
      email: credentials.email?.trim().toLowerCase() || "",
      password: credentials.password
    });

    return response.data;

  } catch (error) {

    // Check for HTML response safely
    const contentType = error.response?.headers['content-type'] || '';
    if (contentType.toLowerCase().includes('text/html')) {
      throw new Error("The server is currently unavailable or returned an invalid page (HTML).");
    }

    // Server error 500
    if (error.response?.status === 500) {
      throw new Error("Server Error (500): The backend crashed. Check if this account exists.");
    }

    // Check for known error messages
    let message = "Invalid email or password"; // default fallback

    if (error.response?.data) {
      if (error.response.data.detail) message = error.response.data.detail;
      else if (error.response.data.message) message = error.response.data.message;
      else if (Array.isArray(error.response.data) && error.response.data[0]?.message) {
        message = error.response.data[0].message;
      }
    }

    // Network errors (no response)
    if (!error.response) {
      message = "Network error: Unable to reach server. Check your internet connection.";
    }

    throw new Error(message);
  }
};

export default api;