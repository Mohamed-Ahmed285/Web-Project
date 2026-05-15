import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import "./AdminDashboard.css";

function MiniChart({ data }) {
  if (!data || data.length === 0) return null;
  const W = 400,
    H = 100,
    pad = 20;
  const counts = data.map((d) => Number(d.count) || 0);
  const max = Math.max(...counts) || 1;
  const points = data.map((d, i) => ({
    x: pad + (i / Math.max(1, data.length - 1)) * (W - pad * 2),
    y: H - pad - (d.count / max) * (H - pad * 2),
    ...d,
  }));
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");
  const areaD = `${pathD} L${points[points.length - 1].x},${H - pad} L${points[0].x},${H - pad} Z`;
  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B6914" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#8B6914" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#areaGrad)" />
      <path
        d={pathD}
        fill="none"
        stroke="#6B4F12"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="3" fill="#6B4F12" />
          <text
            x={p.x}
            y={H - 4}
            textAnchor="middle"
            fontSize="9"
            fill="#8B6914"
          >
            {p.month}
          </text>
        </g>
      ))}
    </svg>
  );
}

function StatCard({ value, label }) {
  return (
    <div className="adm-stat-card">

      <div className="adm-stat-value">{value}</div>
      <div className="adm-stat-label">{label}</div>

    </div>
  );
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);

  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes ago";
  return "Just now";
}

export default function AdminDashboard() {
  const [panel, setPanel] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [animDir, setAnimDir] = useState("forward");
  const [loading, setLoading] = useState(true);
  const [topbooks, setBooks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [adminName, setAdminName] = useState(localStorage.getItem("first_name") || "Admin");
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem("avatar_url") || "");
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/books/popular?limit=5', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!res.ok) {
          throw new Error("API error");
        }
        const topbooks = await res.json();
        setBooks(topbooks);
      } catch (err) {
        console.error("Failed to fetch books", err);
      }
    };

    const fetchActivities = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/activities/recent', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setActivities(data);
        }
      } catch (err) {
        console.error("Failed to fetch activities", err);
      }
    };

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setDashboardData(data);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard stats", err);
      }
    };

    const loadDashboard = async () => {
      await Promise.all([fetchBooks(), fetchActivities(), fetchStats()]);
      const token = localStorage.getItem("token");
      const userRes = await fetch("/api/user/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      setAdminName(userData.first_name || "Admin");
      setAvatarUrl(userData.profile_image || "");
      setLoading(false);
    };

    loadDashboard();
  }, []);

  const goTo = (idx) => {
    if (animating || idx === panel) return;
    setAnimDir(idx > panel ? "forward" : "backward");
    setAnimating(true);
    setTimeout(() => {
      setPanel(idx);
      setAnimating(false);
    }, 300);
  };

  const activityIcons = {
    read: "📖",
    register: "👤",
    add: "➕",
    review: "⭐",
  };

  return (
    <PageLayout>
      {loading ? (
       <div className="adm-loading" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>Loading...</div>
      ) : (
        <>
          {/* ── Header ── */}
          <div className="adm-header">
            <div className="adm-header-left">
              <div
                className="adm-avatar-btn"
                onClick={() => navigate("/profile")}
                title="View profile"
              >
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={adminName}
                    className="adm-avatar-img"
                  />
                ) : (
                  <span className="adm-avatar-initial">
                    {adminName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h1 className="adm-title">Admin Dashboard</h1>
                <p className="adm-subtitle">Overview of your system</p>
              </div>
            </div>
          </div>
          {/* ── Sliding Panel ── */}
          <div className="adm-slider-wrap">
            <button
              className={`adm-arrow adm-arrow-left ${panel === 0 ? "invisible" : ""}`}
              onClick={() => goTo(0)}
            >
              &#8592;
            </button>

            <div className="adm-viewport">
              <div
                className={`adm-slide ${animating ? `slide-out-${animDir}` : "slide-in"}`}
              >
                {panel === 0 ? (
                  <div className="adm-panel1">
                    <div className="adm-stats">
                      <StatCard
                        value={dashboardData?.stats?.totalBooks?.toLocaleString() || "0"}
                        label="Total Books"
                      />
                      <StatCard
                        value={dashboardData?.stats?.totalUsers?.toLocaleString() || "0"}
                        label="Total Users"
                      />
                      <StatCard
                        value={dashboardData?.stats?.topRatedAvg?.toFixed(1) || "0.0"}
                        label="Rates Avg"
                      />
                    </div>
                    <div className="adm-card adm-chart-card">
                      <h2 className="adm-card-title">Reading Activity</h2>
                      <div className="adm-chart-wrap">
                        {/* Only render the chart if the data has successfully loaded */}
                        {dashboardData?.monthlyActivity ? (
                          <MiniChart data={dashboardData.monthlyActivity} />
                        ) : (
                          <p style={{ fontSize: "13px", color: "#6b4c22", textAlign: "center", marginTop: "20px" }}>Loading chart...</p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="adm-panel2">
                    <div className="adm-grid">
                      <div className="adm-card">
                        <h2 className="adm-card-title">Most Popular Books</h2>
                        <ol className="adm-book-list">
                          {topbooks.map((book, i) => (
                            <li key={book._id} className="adm-book-item">
                              <span className="adm-book-rank">{i + 1}.</span>
                              <div className="adm-book-info">
                                <span className="adm-book-title">
                                  {book.title}
                                </span>
                                <span className="adm-book-author">
                                  {book.author}
                                </span>
                              </div>
                              <span className="adm-book-count">
                                {book.total_reads}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="adm-card">
                        <h2 className="adm-card-title">Recent Activity</h2>
                        <ul className="adm-activity-list">
                          {activities.length === 0 ? (
                            <p style={{ fontSize: "13px", color: "#6b4c22" }}>No recent activity.</p>
                          ) : (
                            activities.map((act) => (
                              <li key={act._id} className="adm-activity-item">
                                <span className="act-icon">
                                  {activityIcons[act.type] || "•"}
                                </span>
                                <div className="adm-act-text">
                                  {act.type === "read" && (
                                    <span>
                                      <strong>{act.user}</strong> read <em>{act.book}</em>
                                    </span>
                                  )}
                                  {act.type === "register" && (
                                    <span>
                                      New user <strong>{act.user}</strong> registered
                                    </span>
                                  )}
                                  {act.type === "add" && (
                                    <span>
                                      Book <em>{act.book}</em> added by Admin
                                    </span>
                                  )}
                                  {act.type === "review" && (
                                    <span>
                                      <strong>{act.user}</strong> reviewed <em>{act.book}</em>
                                    </span>
                                  )}
                                </div>
                                <span className="adm-act-time">{timeAgo(act.createdAt)}</span>
                              </li>
                            ))
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              className={`adm-arrow adm-arrow-right ${panel === 1 ? "invisible" : ""}`}
              onClick={() => goTo(1)}
            >
              &#8594;
            </button>
          </div>

          {/* Dots */}
          <div className="adm-dots">
            <span
              className={`adm-dot ${panel === 0 ? "active" : ""}`}
              onClick={() => goTo(0)}
            />
            <span
              className={`adm-dot ${panel === 1 ? "active" : ""}`}
              onClick={() => goTo(1)}
            />
          </div>

          {/* ── Add Book Button ── */}
          <div className="adm-footer">
            <button
              className="adm-btn-add"
              onClick={() => navigate("/admin/books")}
            >
              + Manage Books
            </button>
          </div>

          <div className="footer-actions">
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </>
      )}
    </PageLayout>
  );
}
