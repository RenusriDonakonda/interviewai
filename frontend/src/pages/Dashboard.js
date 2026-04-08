import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GlassCard from "../components/GlassCard";
import LineChart from "../components/charts/LineChart";
import RadarChart from "../components/charts/RadarChart";
import ProgressRing from "../components/ProgressRing";
import { api } from "../api";
import Logo from "../components/Logo";

const Dashboard = () => {
  const [profile, setProfile] = useState({ name: "" });
  const [stats, setStats] = useState({ totalInterviews: 0, avgScore: 0, improvementRate: 0 });
  const [recent, setRecent] = useState([]);
  const [skills, setSkills] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.profile().then(setProfile).catch(() => undefined);
    api.analytics().then((data) => {
      setStats({
        totalInterviews: data.totalInterviews || 0,
        avgScore: data.avgScore || 0,
        improvementRate: data.improvementRate || 0
      });
    }).catch(() => undefined);
    api.history().then((data) => {
      const sessions = data.sessions || [];
      setRecent(sessions.slice(0, 3));
    }).catch(() => undefined);
    api.resumeSkills().then((data) => setSkills(data.skills || [])).catch(() => undefined);
  }, []);

  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    values: [65, 72, 70, 76, 80, 85]
  };

  const radarData = {
    labels: skills.length ? skills.map((skill) => skill.skill || skill) : ["React", "System Design", "Behavioral"],
    values: skills.length ? skills.map(() => 70) : [80, 68, 74]
  };

  return (
    <div>
      <section className="section">
        <div className="dashboard-header">
          <div>
            <Logo withMark />
            <h2>Welcome back, {profile.name || "Candidate"}!</h2>
          </div>
          <button className="secondary-button" onClick={() => navigate("/profile")}>View Profile</button>
        </div>
        <p className="section-caption">Your InterviewAI Stats</p>
        <div className="stats-grid">
          <GlassCard>
            <div className="section-caption">Overall Score</div>
            <ProgressRing value={stats.avgScore || 85} />
          </GlassCard>
          <GlassCard>
            <div className="section-caption">Interviews</div>
            <div className="stat-number">{stats.totalInterviews || 0}</div>
          </GlassCard>
          <GlassCard>
            <div className="section-caption">Improvement</div>
            <div className="stat-number">+{stats.improvementRate || 0}%</div>
          </GlassCard>
          <GlassCard>
            <div className="section-caption">Skills Mastered</div>
            <div className="stat-number">{skills.length}</div>
          </GlassCard>
        </div>
      </section>

      <section className="section chart-grid">
        <GlassCard>
          <h3>Performance Trends</h3>
          <LineChart data={lineData} />
        </GlassCard>
        <GlassCard>
          <h3>Skill Strength Meter</h3>
          <RadarChart data={radarData} />
        </GlassCard>
      </section>

      <section className="section">
        <div className="quick-actions">
          <button className="primary-button" onClick={() => navigate("/interview")}>New Interview</button>
          <button className="secondary-button" onClick={() => navigate("/resume")}>Upload Resume</button>
        </div>
      </section>

      <section className="section">
        <GlassCard>
          <h3>Recent Interviews</h3>
          <ul>
            {recent.map((item) => (
              <li key={item._id}>
                {item.sessionType} Interview — {item.overallScore || 0}%
              </li>
            ))}
            {!recent.length && <li>No interviews yet. Start your first session.</li>}
          </ul>
        </GlassCard>
      </section>
    </div>
  );
};

export default Dashboard;
