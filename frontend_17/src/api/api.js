// // api.js
// import axios from "axios";

// export const BASE_URL = "http://localhost:8081";

// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;

// // api.js
// import axios from "axios";

// // This will use the environment variable 'VITE_API_BASE_URL' if it's set during the build process.
// // If it's not set (e.g., during local development without a .env file, or if the variable name is wrong),
// // it will fall back to 'http://localhost:5050/api/'.
// // When deployed on Vercel, Vercel will inject the 'VITE_API_BASE_URL' you configure there.
// export const BASE_URL =
//   import.meta.env.VITE_API_BASE_URL || "http://localhost:5050";

// const api = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
// });

// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// export default api;

// api.js
import axios from "axios";

// This is the CRITICAL CHANGE:
export const BASE_URL = import.meta.env.VITE_APP_BACKEND_URL;

// You can add a console log here to verify it during development/build
console.log("API Base URL used:", BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;