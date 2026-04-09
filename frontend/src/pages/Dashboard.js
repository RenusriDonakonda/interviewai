import React, { useEffect, useMemo, useState } from "react";
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
      setRecent(sessions.slice(0, 5));
    }).catch(() => undefined);
    api.resumeSkills().then((data) => setSkills(data.skills || [])).catch(() => undefined);
  }, []);

  const radarData = {
    labels: skills.length ? skills.map((skill) => skill.skill || skill) : ["React", "System Design", "Behavioral"],
    values: skills.length ? skills.map(() => 70) : [80, 68, 74]
  };

  const sparkline = useMemo(() => {
    if (!recent.length) return { labels: ["A", "B"], values: [0, 0] };
    return {
      labels: recent.map((item) => new Date(item.sessionDate).toLocaleDateString()),
      values: recent.map((item) => item.overallScore || 0)
    };
  }, [recent]);

  return (
    <div>
      <section className="section">
        <div className="dashboard-header">
          <div>
            <Logo withMark size="lg" />
            <h2>Welcome back, {profile.name || "Candidate"}!</h2>
          </div>
          <button className="secondary-button" onClick={() => navigate("/profile")}>View Profile</button>
        </div>
        <p className="section-caption">Your InterviewAI Stats</p>
        <div className="stats-grid">
          <GlassCard>
            <div className="section-caption">Overall Score</div>
            <ProgressRing value={stats.avgScore || 0} />
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
          <LineChart data={sparkline} />
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
          <div className="dashboard-recent-header">
            <h3>Recent Interviews</h3>
            <button className="secondary-button" onClick={() => navigate("/analytics")}>View All</button>
          </div>
          <div className="recent-list">
            {recent.map((item) => (
              <div key={item._id} className="recent-item">
                <div>
                  <div className="section-caption">{new Date(item.sessionDate).toLocaleDateString()}</div>
                  <div>{item.sessionType} Interview</div>
                </div>
                <div className="recent-score">{item.overallScore || 0}%</div>
              </div>
            ))}
            {!recent.length && <div className="section-caption">No interviews yet. Start your first session.</div>}
          </div>
        </GlassCard>
      </section>
    </div>
  );
};

export default Dashboard;
