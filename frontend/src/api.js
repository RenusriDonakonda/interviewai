const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

const request = async (path, options = {}) => {
  const token = localStorage.getItem("interviewai_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : await response.blob();
  if (!response.ok) {
    const message = data?.message || "Request failed";
    throw new Error(message);
  }
  return data;
};

export const api = {
  register: (payload) => request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  profile: () => request("/api/user/profile"),
  startInterview: (payload) => request("/api/interview/start", { method: "POST", body: JSON.stringify(payload) }),
  submitAnswer: (payload) => request("/api/interview/submit", { method: "POST", body: JSON.stringify(payload) }),
  history: () => request("/api/interview/history"),
  analytics: () => request("/api/analytics"),
  resumeSkills: () => request("/api/resume/skills"),
  resumeUpload: async (file) => {
    const token = localStorage.getItem("interviewai_token");
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`${API_BASE}/api/resume/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Upload failed");
    return data;
  },
  report: (payload) => request("/api/reports/generate", { method: "POST", body: JSON.stringify(payload) }),
  adminUsers: () => request("/api/admin/users"),
  adminQuestions: () => request("/api/admin/questions"),
  adminAnalytics: () => request("/api/admin/analytics"),
  adminCreateQuestion: (payload) => request("/api/admin/questions", { method: "POST", body: JSON.stringify(payload) }),
  adminUpdateQuestion: (id, payload) => request(`/api/admin/questions/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  adminDeleteQuestion: (id) => request(`/api/admin/questions/${id}`, { method: "DELETE" })
};
