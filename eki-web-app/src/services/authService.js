import axios from 'axios';


const api = axios.create({
  baseURL: "https://api-7w8f.onrender.com",
  headers: {
    "Content-Type": "application/json",
  },
});


api.interceptors.request.use(request => {
  console.log('Starting Request:', request.baseURL + request.url);
  return request;
});


api.interceptors.response.use(
  response => response,
  error => {

    console.error('API Error Response:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);




export const signInUser = async (credentials) => {

  console.log("PAYLOAD BEING SENT:", credentials);

  try {

    const response = await api.post('/api/v1/accounts/signin/', credentials);


    console.log("SERVER SUCCESS:", response.data);

    const token = response.data?.access || response.data?.token;

    if (token) {
      localStorage.setItem('userToken', token);
      console.log('Sign in successful! Token stored in LocalStorage.');
    }

    return response.data;
  } catch (error) {

    console.error("SERVER REJECTION DETAILS:", error.response?.data);

    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.response?.data?.error ||
      "An error occurred during sign in";

    throw new Error(message);
  }
};

export default api;