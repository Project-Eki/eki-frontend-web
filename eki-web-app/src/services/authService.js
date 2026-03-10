import axios from 'axios';

const api = axios.create({
  baseURL: "https://api-7w8f.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});

// Logs for debugging
api.interceptors.request.use(request => {
  console.log('Sending Request to:', request.baseURL + request.url);
  return request;
});

export const signInUser = async (credentials) => {
  try {
    // Ensure the trailing slash is present as per your backend screenshot
    const response = await api.post('/api/v1/accounts/signin/', {
      email: credentials.email.trim().toLowerCase(),
      password: credentials.password
    });

    // Handle different token formats (access vs token)
    const token = response.data?.access || response.data?.token;
    const refreshToken = response.data?.refresh;

    if (token) {
      localStorage.setItem('userToken', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    }

    return response.data;
  } catch (error) {
    // This prevents the "HTML Alert" by catching the 500 status specifically
    if (error.response?.status === 500) {
      throw new Error("Server Error (500): The backend crashed. Check if this account exists.");
    }

    const message = 
      error.response?.data?.detail || 
      error.response?.data?.message || 
      "Invalid email or password";
      
    throw new Error(message);
  }
};

export default api;