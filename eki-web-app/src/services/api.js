// import axios from 'axios';
// // axios instance
// const api = axios.create({
//   baseURL: "/api/v1/accounts", // Vite will proxy this to Django backend
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// // Register
// export const registerUser = async (userData) => {
//   try {
//     const response = await api.post("/auth/register/", userData);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.detail || "Registration failed");
//   }
// };

// // Verify email
// export const verifyEmail = async (token) => {
//   try {
//     const response = await api.post("/auth/verify-email/", { token });
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.detail || "Email verification failed");
//   }
// }

// // Submit business identity
// export const submitBusinessIdentity = async (data) => {
//   try {
//     const response = await api.post("/vendor/documents/", data);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.detail || "Business info submission failed");
//   }
// };

// // Submit contact & location
// export const submitContactLocation = async (data) => {
//   try {
//     const response = await api.post("/vendor/profile/", data);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.detail || "Contact info submission failed");
//   }
// };


// // Submit operations & compliance
// export const submitOperationCompliance = async (data) => {
//   try {
//     const response = await api.post("/vendor/profile/", data);
//     return response.data;
//   } catch (error) {
//     throw new Error(error.response?.data?.detail || "Operation compliance submission failed");
//   }
// };
