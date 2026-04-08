import React, { useEffect, useRef, useState } from "react";
import GlassCard from "../components/GlassCard";
import { api } from "../api";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", theme: "dark", emailNotifications: true });
  const [avatarUrl, setAvatarUrl] = useState("");
  const fileRef = useRef(null);

  useEffect(() => {
    api.profile()
      .then((data) => {
        setProfile(data);
        setForm({
          name: data.name || "",
          email: data.email || "",
          theme: data.theme || "dark",
          emailNotifications: data.emailNotifications ?? true
        });
        setAvatarUrl(data.avatarUrl || "");
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("interviewai_token");
    window.location.href = "/";
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const updated = await api.updateProfile(form);
      setProfile(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (file) => {
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      const data = await api.uploadAvatar(file);
      setAvatarUrl(data.avatarUrl);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setSaving(true);
    setError("");
    try {
      const data = await api.removeAvatar();
      setAvatarUrl(data.avatarUrl || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) {
    return (
      <div className="section">
        <GlassCard>
          <h2>Profile</h2>
          <p className="section-caption">Loading your InterviewAI profile...</p>
          {error && <div className="badge" style={{ background: "rgba(239, 68, 68, 0.2)" }}>{error}</div>}
        </GlassCard>
      </div>
    );
  }

  return (
    <div>
      <section className="section">
        <GlassCard>
          <div className="profile-header">
            <div className="avatar-block">
              <div className="avatar-preview">
                {avatarUrl ? <img src={avatarUrl} alt="Profile" /> : <span>{profile.name?.[0] || "U"}</span>}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={(event) => handleAvatarUpload(event.target.files?.[0])}
              />
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <button className="secondary-button" onClick={() => fileRef.current?.click()}>
                  Upload Photo
                </button>
                <button className="secondary-button" onClick={handleRemoveAvatar} disabled={saving}>
                  Remove Photo
                </button>
              </div>
            </div>
            <div>
              <h2>{profile.name}</h2>
              <div className="section-caption">{profile.email}</div>
              <div className="badge">{profile.subscription}</div>
            </div>
          </div>

          {error && <div className="badge" style={{ background: "rgba(239, 68, 68, 0.2)" }}>{error}</div>}

          <div style={{ marginTop: "20px" }}>
            <button className="primary-button" onClick={() => setEditing((prev) => !prev)}>
              {editing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          {editing && (
            <div style={{ marginTop: "20px" }}>
              <div className="input-group">
                <label>Name</label>
                <input
                  className="input-field"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Email</label>
                <input
                  className="input-field"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </div>
              <div className="input-group">
                <label>Theme</label>
                <select
                  className="select-field"
                  value={form.theme}
                  onChange={(event) => setForm({ ...form, theme: event.target.value })}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>
              <div className="input-group">
                <label>Email Notifications</label>
                <select
                  className="select-field"
                  value={form.emailNotifications ? "yes" : "no"}
                  onChange={(event) => setForm({ ...form, emailNotifications: event.target.value === "yes" })}
                >
                  <option value="yes">Enabled</option>
                  <option value="no">Disabled</option>
                </select>
              </div>
              <button className="primary-button" onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </GlassCard>
      </section>

      <section className="section">
        <GlassCard>
          <h3>InterviewAI Preferences</h3>
          <div className="features-grid">
            <div>
              <div className="section-caption">Theme</div>
              <div>{profile.theme}</div>
            </div>
            <div>
              <div className="section-caption">Email Notifications</div>
              <div>{profile.emailNotifications ? "Enabled" : "Disabled"}</div>
            </div>
            <div>
              <div className="section-caption">Total Interviews</div>
              <div>{profile.totalInterviews}</div>
            </div>
            <div>
              <div className="section-caption">Average Score</div>
              <div>{profile.averageScore}%</div>
            </div>
          </div>
          <button className="secondary-button" style={{ marginTop: "16px" }} onClick={handleLogout}>
            Log Out
          </button>
        </GlassCard>
      </section>
    </div>
  );
};

export default Profile;
