import React, { useEffect, useState } from "react";
import GlassCard from "../components/GlassCard";
import { api } from "../api";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.profile()
      .then(setProfile)
      .catch((err) => setError(err.message));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("interviewai_token");
    window.location.href = "/";
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
          <h2>Profile</h2>
          <p className="section-caption">Your InterviewAI account details.</p>
          <div className="features-grid">
            <div>
              <div className="section-caption">Name</div>
              <div>{profile.name}</div>
            </div>
            <div>
              <div className="section-caption">Email</div>
              <div>{profile.email}</div>
            </div>
            <div>
              <div className="section-caption">Role</div>
              <div>{profile.role}</div>
            </div>
            <div>
              <div className="section-caption">Subscription</div>
              <div>{profile.subscription}</div>
            </div>
          </div>
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
