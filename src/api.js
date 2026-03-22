import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 🔁 Prevent multiple redirects
let isRedirecting = false;

// ✅ Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No token found");
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !isRedirecting) {
      isRedirecting = true;

      console.warn("❌ Session expired, redirecting to login");

      // 🧹 remove only auth data (safe)
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // 🚫 avoid reload loops
      if (window.location.pathname !== "/login") {
        window.location.replace("/login");
      }
    }

    return Promise.reject(error);
  }
);

// =========================
// 🔐 Auth
// =========================
export const registerUser = (data) =>
  API.post("/api/auth/register", data);

export const loginUser = (data) =>
  API.post("/api/auth/login", data);

export const getCurrentUser = () =>
  API.get("/api/auth/me");

// =========================
// 🔗 GitHub
// =========================
export const getGithubRepos = () =>
  API.get("/api/github/repos");

// =========================
// 📦 Repo
// =========================
export const addRepo = (data) =>
  API.post("/api/repos", data);

// =========================
// 📊 Dashboard
// =========================
export const getDashboard = (repoId) =>
  API.get(`/api/dashboard/${repoId}`);

export default API;