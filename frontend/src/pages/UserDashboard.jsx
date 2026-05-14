/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import React from "react";
import SearchCatalog from "./SearchCatalog";
import PageLayout from "./PageLayout";
import { useNavigate } from "react-router-dom";
import { useBookStore } from "../context/BookStoreContext";
import emptyCollectionImg from "../assets/CollectionIsEmpty.png";

// ── Sub-components ─────────────────────────────────────────────────────────────
function BookCard({ book }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  return (
    <div
      style={{
        ...s.bookCard,
        transform: hovered ? "translateY(-6px) scale(1.03)" : "none",
        transition: "transform 0.25s ease",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/book/${book._id}`)}
    >
      <div style={s.coverWrap}>
        <img src={book.cover_image.medium} alt={book.title} style={s.coverImg} />
      </div>
      <p style={s.bookTitle}>{book.title}</p>
      <p style={s.bookAuthor}>{book.author}</p>
    </div>
  );
}

function CollectionCard({ col }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const placeholderImg = emptyCollectionImg;

  return (
    <div
      style={s.collCard}
      onClick={() => navigate(`/collection/${col._id}`)}
    >
      <div style={s.collCovers}>
        {/* Check if the collection has books */}
        {col.books && col.books.length > 0 ? (
          col.books.slice(0, 2).map((b, i) => (
            <img
              key={b._id || i}
              src={b.cover_image.medium || placeholderImg}
              alt={b.title || "Book"}
              style={{
                ...s.collCover,
                left: `${i * 38}px`,
                zIndex: i === 0 ? 1 : 2,
                transform: i === 0 ? "rotate(-6deg)" : "rotate(3deg)",
              }}
            />
          ))
        ) : (
          // < img
          //   src={placeholderImg}
          //   alt="Empty Collection"
          //   style={{
          //     ...s.collCover,
          //     left: "20px",
          //     transform: "rotate(-2deg)",
          //     opacity: 0.7,
          //   }}
          // />
          <div className="empty-collection-card">
            <svg className="empty-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>

              <circle cx="18" cy="6" r="4.5" fill="rgba(255, 248, 220, 0.9)"></circle>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 6h4m-2-2v4"></path>
            </svg>

            <h2 className="empty-title">This collection is empty</h2>
          </div>
        )}
      </div>
      <p style={s.collName}>{col.name}</p>
    </div>
  );
}

function ScrollRow({ children, visibleCount = 4 }) {
  const [index, setIndex] = useState(0);
  const items = React.Children.toArray(children);
  const total = items.length;

  if (total === 0) return null;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  const visible = Array.from(
    { length: Math.min(visibleCount, total) },
    (_, k) => items[(index + k) % total],
  );

  return (
    <div style={s.rowOuter}>
      <button style={s.arrowBtn} onClick={prev}>
        &#8249;
      </button>
      <div style={s.rowViewport}>
        <div style={s.rowTrack}>{visible}</div>
      </div>
      <button style={s.arrowBtn} onClick={next}>
        &#8250;
      </button>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const [books, setBooks] = useState([]);
  const { collections, isCollectionsLoading } = useBookStore();
  const [userName, setUserName] = useState("Reader");
  const [isLoading, setIsLoading] = useState(true);
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("first_name");
    localStorage.removeItem("second_name");
    window.location.href = "/login";
  };


  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const booksRes = await fetch("http://localhost:5000/api/books", { headers });

        if (!booksRes.ok) {
          throw new Error("API error");
        }

        const booksData = await booksRes.json();

        setBooks(booksData);
        setUserName(localStorage.getItem("first_name") || "Reader");
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.message === "API error") {
          console.error("One or more API requests failed.");
          localStorage.removeItem("token");
          window.location.href = "/login"; // redirect
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isCollectionsLoading || isLoading) {
    return (
      <PageLayout>
        <div style={s.loadingWrapper}>
          <style>{`
            @keyframes ud-spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <div style={s.spinner} />
          <p style={s.loadingText}>Loading your dashboard...</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.welcomeTitle}>Welcome back, {userName}</h1>
          <p style={s.tagline}>
            <em>A reader lives a thousand lives before he dies.</em>
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={s.searchRow}>
        <SearchCatalog
          books={books}
          onSearch={(q, results) => console.log("Search:", q, results)}
        />
      </div>

      {/* Top Books */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Top Books</h2>
        <ScrollRow itemWidth={140} visibleCount={7}>
          {books.map((b) => (
            <BookCard key={b._id} book={b} />
          ))}
        </ScrollRow>
      </section>

      {/* My Collections */}
      <section style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>My Collections</h2>
          <button style={s.createCollectionBtn}>
            + Create Collection
          </button>
        </div>

        {collections.length === 0 ? (
          <div style={s.emptyCollectionState}>
            <p style={s.emptyCollectionText}>No collections yet. Create one to start organizing your books.</p>
          </div>
        ) : (
          <ScrollRow itemWidth={260} visibleCount={4}>
            {collections.map((c) => (
              <CollectionCard key={c._id} col={c} />
            ))}
          </ScrollRow>
        )}
      </section>

      <div style={s.footerActions}>
        <button style={s.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </PageLayout>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  welcomeTitle: {
    fontFamily: "'Cinzel', 'EB Garamond', serif",
    fontSize: "clamp(22px, 3vw, 32px)",
    fontWeight: 700,
    color: "#2c1a07",
    letterSpacing: "0.01em",
    lineHeight: 1.2,
  },
  tagline: {
    fontSize: "14px",
    color: "#6b4c22",
    marginTop: "5px",
    letterSpacing: "0.02em",
  },
  logoutBtn: {
    background: "#8b1a1a",
    color: "#f5e6c8",
    // font-family: "Playfair Display, serif",
    // background: "#8b3e2f",
    // border: "none",
    borderRadius: "12px",
    border: "2px solid #6b1010",
    // color: "#fff",
    fontWeight: 600,
    padding: "12px 18px",
    cursor: "pointer",
    boxShadow: "0 6px 18px rgba(139,62,47,0.18)",
    transition: "transform 0.2s, background 0.2s",
  },
  footerActions: {
    marginTop: "28px",
    display: "flex",
    justifyContent: "flex-end",
  },
  searchRow: {
    display: "flex",
  },
  loadingWrapper: {
    minHeight: "calc(100vh - 80px)",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    gap: "22px",
    color: "#f5e4b9",
    textAlign: "center",
  },
  spinner: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    border: "8px solid #d0b17a",
    borderTopColor: "#26160b",
    animation: "ud-spin 1s linear infinite",
    boxShadow: "0 0 0 5px rgba(255, 255, 255, 0.03), inset 0 0 0 1px rgba(255,255,255,0.15)",
  },
  loadingText: {
    fontFamily: "'EB Garamond', serif",
    fontSize: "16px",
    color: "#26160b",
    maxWidth: "320px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "14px",
    marginBottom: "18px",
  },
  emptyCollectionState: {
    padding: "40px",
    border: "1.5px dashed rgba(101,67,33,0.35)",
    borderRadius: "18px",
    textAlign: "center",
    margin: "12px 60px",

    // background: "rgba(255,249,236,0.75)",
  },
  emptyCollectionText: {
    color: "#6b4c22",
    fontFamily: "'EB Garamond', serif",
    fontSize: "21px",
    // marginBottom: "16px",
  },
  createCollectionBtn: {
    background: "#2c1a07",
    border: "none",
    borderRadius: "14px",
    color: "#f9edcd",
    fontWeight: 700,
    padding: "11px 18px",
    cursor: "pointer",
    transition: "background 0.2s, transform 0.2s",
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  sectionTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: "18px",
    fontWeight: 600,
    color: "#2c1a07",
    letterSpacing: "0.04em",
  },
  rowOuter: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  rowViewport: {
    flex: 1,
    overflow: "hidden",
  },
  rowTrack: {
    display: "flex",
    gap: "24px",
  },
  arrowBtn: {
    background: "rgba(255,255,255,0.25)",
    border: "1.5px solid rgba(101,67,33,0.4)",
    borderRadius: "50%",
    width: "34px",
    height: "34px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: "22px",
    color: "#4a2e0a",
    lineHeight: 1,
    flexShrink: 0,
    transition: "background 0.2s",
  },
  bookCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    flexShrink: 0,
    width: "130px",
  },
  coverWrap: {
    width: "110px",
    height: "155px",
    borderRadius: "6px",
    overflow: "hidden",
    boxShadow: "4px 6px 18px rgba(50,25,5,0.45)",
    border: "2px solid rgba(101,67,33,0.3)",
  },
  coverImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  bookTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#2c1a07",
    textAlign: "center",
    lineHeight: 1.3,
  },
  bookAuthor: {
    fontSize: "12px",
    color: "#7a5c2e",
    textAlign: "center",
  },
  collCard: {
    background: "rgba(255,255,255,0.20)",
    border: "1.5px solid rgba(101,67,33,0.35)",
    borderRadius: "14px",
    width: "260px",
    flexShrink: 0,
    padding: "24px 20px 18px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "18px",
    cursor: "pointer",
    backdropFilter: "blur(2px)",
    boxShadow: "0 4px 16px rgba(50,25,5,0.15)",
    transition:
      "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
  },
  collCovers: {
    position: "relative",
    height: "120px",
    width: "140px",
  },
  collCover: {
    position: "absolute",
    width: "80px",
    height: "115px",
    objectFit: "cover",
    borderRadius: "5px",
    boxShadow: "3px 5px 14px rgba(30,15,0,0.5)",
    border: "1.5px solid rgba(101,67,33,0.3)",
  },
  collName: {
    fontFamily: "'Cinzel', serif",
    fontSize: "14px",
    fontWeight: 600,
    color: "#2c1a07",
    letterSpacing: "0.05em",
  },
  singleCollImage: {
    width: "140px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "8px",
    boxShadow: "3px 5px 14px rgba(30,15,0,0.5)",
  },
};
