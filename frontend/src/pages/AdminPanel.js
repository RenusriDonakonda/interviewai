import React, { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import { api } from "../api";

const emptyForm = {
  category: "technical",
  skill: "",
  difficulty: "medium",
  question: "",
  idealAnswer: "",
  keywords: "",
  company: ""
};

const pageSize = 5;

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [error, setError] = useState("");

  const loadData = () => {
    api.adminUsers().then((data) => setUsers(data.users || [])).catch(() => undefined);
    api.adminQuestions().then((data) => setQuestions(data.questions || [])).catch(() => undefined);
    api.adminAnalytics().then((data) => setAnalytics(data || {})).catch(() => undefined);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    setError("");
    const payload = {
      ...form,
      keywords: form.keywords.split(",").map((k) => k.trim()).filter(Boolean)
    };
    try {
      if (editingId) {
        await api.adminUpdateQuestion(editingId, payload);
      } else {
        await api.adminCreateQuestion(payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = (question) => {
    setEditingId(question._id);
    setForm({
      category: question.category,
      skill: question.skill,
      difficulty: question.difficulty,
      question: question.question,
      idealAnswer: question.idealAnswer,
      keywords: (question.keywords || []).join(", "),
      company: question.company || ""
    });
  };

  const handleDelete = async (id) => {
    setError("");
    try {
      await api.adminDeleteQuestion(id);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = questions.filter((question) => {
    const haystack = `${question.question} ${question.skill} ${question.category} ${question.company || ""}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div>
      <section className="section">
        <h2>Admin Panel</h2>
        <p className="section-caption">Role-based access for InterviewAI operations.</p>
      </section>
      <section className="section features-grid">
        <GlassCard>
          <h3>User Management</h3>
          <p className="section-caption">Monitor signups, subscriptions, and engagement.</p>
          <div className="section-caption">Total Users: {analytics.totalUsers || users.length}</div>
        </GlassCard>
        <GlassCard>
          <h3>System Analytics</h3>
          <p className="section-caption">Total Interviews: {analytics.totalInterviews || 0}</p>
          <p className="section-caption">Average Score: {analytics.avgScore || 0}%</p>
        </GlassCard>
        <GlassCard>
          <h3>Question Bank Editor</h3>
          <p className="section-caption">Curate questions with difficulty and company focus.</p>
          {error && <div className="badge" style={{ background: "rgba(239, 68, 68, 0.2)" }}>{error}</div>}
          <div className="input-group">
            <label>Category</label>
            <select
              className="select-field"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
            >
              <option value="technical">Technical</option>
              <option value="behavioral">Behavioral</option>
              <option value="system-design">System Design</option>
            </select>
          </div>
          <div className="input-group">
            <label>Skill</label>
            <input className="input-field" value={form.skill} onChange={(event) => setForm({ ...form, skill: event.target.value })} />
          </div>
          <div className="input-group">
            <label>Difficulty</label>
            <select
              className="select-field"
              value={form.difficulty}
              onChange={(event) => setForm({ ...form, difficulty: event.target.value })}
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div className="input-group">
            <label>Question</label>
            <textarea className="textarea-field" value={form.question} onChange={(event) => setForm({ ...form, question: event.target.value })} />
          </div>
          <div className="input-group">
            <label>Ideal Answer</label>
            <textarea className="textarea-field" value={form.idealAnswer} onChange={(event) => setForm({ ...form, idealAnswer: event.target.value })} />
          </div>
          <div className="input-group">
            <label>Keywords (comma separated)</label>
            <input className="input-field" value={form.keywords} onChange={(event) => setForm({ ...form, keywords: event.target.value })} />
          </div>
          <div className="input-group">
            <label>Company</label>
            <input className="input-field" value={form.company} onChange={(event) => setForm({ ...form, company: event.target.value })} />
          </div>
          <button className="primary-button" onClick={handleSubmit}>
            {editingId ? "Update Question" : "Create Question"}
          </button>
        </GlassCard>
        <GlassCard>
          <h3>Question Bank</h3>
          <div className="input-group">
            <label>Search</label>
            <input
              className="input-field"
              placeholder="Search by skill, category, company, or text"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <ul>
            {pageItems.map((question) => (
              <li key={question._id}>
                {question.question}
                <div className="section-caption">{question.skill} • {question.difficulty} • {question.company || "General"}</div>
                <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                  <button className="secondary-button" onClick={() => handleEdit(question)}>Edit</button>
                  <button className="secondary-button" onClick={() => handleDelete(question._id)}>Delete</button>
                </div>
              </li>
            ))}
          </ul>
          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <button className="secondary-button" onClick={() => setPage(Math.max(1, safePage - 1))} disabled={safePage === 1}>
              Prev
            </button>
            <div className="section-caption">Page {safePage} of {totalPages}</div>
            <button className="secondary-button" onClick={() => setPage(Math.min(totalPages, safePage + 1))} disabled={safePage === totalPages}>
              Next
            </button>
          </div>
        </GlassCard>
        <GlassCard>
          <h3>Global Performance</h3>
          <p className="section-caption">Aggregate scores across all users and sessions.</p>
          <ul>
            {users.slice(0, 5).map((user) => (
              <li key={user._id}>{user.name}</li>
            ))}
          </ul>
        </GlassCard>
      </section>
    </div>
  );
};

export default AdminPanel;
