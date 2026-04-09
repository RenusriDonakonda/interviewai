const getApiBase = () => {
  return (
    process.env.REACT_APP_API_URL ||
    window.__INTERVIEWAI_API_URL__ ||
    ""
  );
};

const request = async (path, options = {}) => {
  const apiBase = getApiBase();
  if (!apiBase) {
    throw new Error("API URL is not configured. Set REACT_APP_API_URL in Netlify and redeploy.");
  }
  const token = localStorage.getItem("interviewai_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${apiBase}${path}`, { ...options, headers });
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : await response.blob();
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("interviewai_token");
    }
    const message = data?.message || "Request failed";
    throw new Error(message);
  }
  return data;
};

const streamRequest = async ({ path, payload, onDelta, onDone }) => {
  const apiBase = getApiBase();
  if (!apiBase) {
    throw new Error("API URL is not configured. Set REACT_APP_API_URL in Netlify and redeploy.");
  }
  const token = localStorage.getItem("interviewai_token");
  const response = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Stream failed");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) return;
      const data = trimmed.replace(/^data:\s*/, "");
      try {
        const parsed = JSON.parse(data);
        if (parsed.type === "delta" && onDelta) onDelta(parsed.delta || "");
        if (parsed.type === "done" && onDone) onDone(parsed);
      } catch {
        // ignore
      }
    });
  }
};

const friendlyNetworkError = (error) => {
  const message = error?.message || "Network error";
  if (message.toLowerCase().includes("failed to fetch")) {
    return "Network error while contacting InterviewAI API. Check that REACT_APP_API_URL points to your Render backend and that it is awake.";
  }
  return message;
};

export const api = {
  register: (payload) => request("/api/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  profile: () => request("/api/user/profile"),
  updateProfile: (payload) => request("/api/user/profile", { method: "PUT", body: JSON.stringify(payload) }),
  uploadAvatar: async (file) => {
    const apiBase = getApiBase();
    if (!apiBase) {
      throw new Error("API URL is not configured. Set REACT_APP_API_URL in Netlify and redeploy.");
    }
    const token = localStorage.getItem("interviewai_token");
    const form = new FormData();
    form.append("file", file);
    let response;
    try {
      response = await fetch(`${apiBase}/api/user/avatar`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form
      });
    } catch (error) {
      throw new Error(friendlyNetworkError(error));
    }
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data?.message || "Upload failed");
    }
    return data;
  },
  removeAvatar: () => request("/api/user/avatar", { method: "DELETE" }),
  startInterview: (payload) => request("/api/interview/start", { method: "POST", body: JSON.stringify(payload) }),
  submitAnswer: (payload) => request("/api/interview/submit", { method: "POST", body: JSON.stringify(payload) }),
  submitAnswerStream: (payload, onDelta, onDone) =>
    streamRequest({ path: "/api/interview/submit/stream", payload, onDelta, onDone }),
  history: () => request("/api/interview/history"),
  analytics: () => request("/api/analytics"),
  resumeSkills: () => request("/api/resume/skills"),
  resumeUpload: async (file) => {
    const apiBase = getApiBase();
    if (!apiBase) {
      throw new Error("API URL is not configured. Set REACT_APP_API_URL in Netlify and redeploy.");
    }
    const token = localStorage.getItem("interviewai_token");
    const form = new FormData();
    form.append("file", file);
    let response;
    try {
      response = await fetch(`${apiBase}/api/resume/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form
      });
    } catch (error) {
      throw new Error(friendlyNetworkError(error));
    }
    let data = {};
    try {
      data = await response.json();
    } catch {
      // ignore non-json
    }
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem("interviewai_token");
      }
      throw new Error(data?.message || "Upload failed");
    }
    return data;
  },
  report: (payload) => request("/api/reports/generate", { method: "POST", body: JSON.stringify(payload) })
};
