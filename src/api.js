import axios from "axios";

export const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8080";

const API = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // 입장 세션 쿠키를 함께 보냄
});

// 입장하지 않은 상태(401)면 입장 화면으로 보냄
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const url = err.config?.url || "";
    if (err.response?.status === 401 && !url.startsWith("/api/access")) {
      if (window.location.pathname !== "/enter") window.location.assign("/enter");
    }
    return Promise.reject(err);
  }
);

export const errorMessage = (err, fallback) => err?.response?.data?.message || fallback;

export const fileUrl = (submissionId) => `${API_BASE}/api/submissions/${submissionId}/file`;

export default API;
