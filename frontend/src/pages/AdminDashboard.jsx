import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import "./AdminDashboard.css";

const MOCK_DATA = {
  stats: {
    totalBooks: 1248,
    totalUsers: 342,
    topRatedAvg: 4.7,
  },
  popularBooks: [
    {
      _id: "1",
      title: "The Alchemist",
      author: "Paulo Coelho",
      totalComments: 320,
    },
    {
      _id: "2",
      title: "Atomic Habits",
      author: "James Clear",
      totalComments: 278,
    },
    {
      _id: "3",
      title: "The 48 Laws of Power",
      author: "Robert Greene",
      totalComments: 245,
    },
    {
      _id: "4",
      title: "Think and Grow Rich",
      author: "Napoleon Hill",
      totalComments: 198,
    },
    {
      _id: "5",
      title: "The Power of Habit",
      author: "Charles Duhigg",
      totalComments: 176,
    },
  ],
  recentActivity: [
    {
      id: "a2",
      type: "register",
      user: "Sarah Smith",
      book: null,
      time: "1 hour ago",
    },
    {
      id: "a3",
      type: "add",
      user: "Admin",
      book: "Atomic Habits",
      time: "3 hours ago",
    },
    {
      id: "a4",
      type: "review",
      user: "Omar Khaled",
      book: "The 48 Laws of Power",
      time: "5 hours ago",
    },
  ],
  monthlyActivity: [
    { month: "Jan", count: 90 },
    { month: "Feb", count: 180 },
    { month: "Mar", count: 260 },
    { month: "Apr", count: 210 },
    { month: "May", count: 380 },
    { month: "Jun", count: 260 },
    { month: "Jul", count: 310 },
  ],
};

function useDashboardData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setTimeout(() => {
      setData(MOCK_DATA);
      setLoading(false);
    }, 600);
  }, []);
  return { data, loading };
}

function MiniChart({ data }) {
  if (!data || data.length === 0) return null;
  const W = 400,
    H = 100,
    pad = 20;
  const max = Math.max(...data.map((d) => d.count));
  const points = data.map((d, i) => ({
    x: pad + (i / (data.length - 1)) * (W - pad * 2),
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
      <div>
        <div className="adm-stat-value">{value}</div>
        <div className="adm-stat-label">{label}</div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { data, loading } = useDashboardData();
  const [panel, setPanel] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [animDir, setAnimDir] = useState("forward");
  const navigate = useNavigate();

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
    borrow: "📖",
    register: "👤",
    add: "➕",
    review: "⭐",
  };

  return (
    <PageLayout>
      {/* ── Header ── */}
      <div className="adm-header">
        <div>
          <h1 className="adm-title">Admin Dashboard</h1>
          <p className="adm-subtitle">Overview of your system</p>
        </div>
      </div>

      {loading && <div className="adm-loading">Loading...</div>}

      {data && (
        <>
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
                        value={data.stats.totalBooks.toLocaleString()}
                        label="Total Books"
                      />
                      <StatCard
                        value={data.stats.totalUsers.toLocaleString()}
                        label="Total Users"
                      />
                      <StatCard
                        value={data.stats.topRatedAvg.toFixed(1)}
                        label="Top Rated Avg"
                      />
                    </div>
                    <div className="adm-card adm-chart-card">
                      <h2 className="adm-card-title">Reading Activity</h2>
                      <div className="adm-chart-wrap">
                        <MiniChart data={data.monthlyActivity} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="adm-panel2">
                    <div className="adm-grid">
                      <div className="adm-card">
                        <h2 className="adm-card-title">Most Popular Books</h2>
                        <ol className="adm-book-list">
                          {data.popularBooks.map((book, i) => (
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
                                {book.totalComments}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                      <div className="adm-card">
                        <h2 className="adm-card-title">Recent Activity</h2>
                        <ul className="adm-activity-list">
                          {data.recentActivity.map((act) => (
                            <li key={act.id} className="adm-activity-item">
                              <span className="act-icon">
                                {activityIcons[act.type] || "•"}
                              </span>
                              <div className="adm-act-text">
                                {act.type === "borrow" && (
                                  <span>
                                    <strong>{act.user}</strong> borrowed{" "}
                                    <em>{act.book}</em>
                                  </span>
                                )}
                                {act.type === "register" && (
                                  <span>
                                    New user <strong>{act.user}</strong>{" "}
                                    registered
                                  </span>
                                )}
                                {act.type === "add" && (
                                  <span>
                                    Book <em>{act.book}</em> added by Admin
                                  </span>
                                )}
                                {act.type === "review" && (
                                  <span>
                                    <strong>{act.user}</strong> reviewed{" "}
                                    <em>{act.book}</em>
                                  </span>
                                )}
                              </div>
                              <span className="adm-act-time">{act.time}</span>
                            </li>
                          ))}
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
        </>
      )}
    </PageLayout>
  );
}
