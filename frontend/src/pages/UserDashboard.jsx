/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import React from "react";
import SearchCatalog from "./SearchCatalog";
import PageLayout from "./PageLayout";
import { useNavigate } from "react-router-dom";
import { useBookStore } from "../context/BookStoreContext";
import emptyCollectionImg from "../assets/CollectionIsEmpty.png";

// ── Scrollable Row with Buttons ───────────────────────────────────────────────
function ScrollRow({ children, itemWidth = 150 }) {
  const rowRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkScroll = () => {
    const el = rowRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [children]);

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * itemWidth * 3, behavior: "smooth" });
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      {/* Left Button — always reserves space so track doesn't jump */}
      <button
        onClick={() => scroll(-1)}
        style={{
          ...s.scrollBtn,
          opacity: canLeft ? 1 : 0,
          pointerEvents: canLeft ? "auto" : "none",
          flexShrink: 0,
        }}
        aria-label="Scroll left"
        tabIndex={canLeft ? 0 : -1}
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Scrollable track — takes all remaining space */}
      <div ref={rowRef} className="ud-track" style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>

      {/* Right Button */}
      <button
        onClick={() => scroll(1)}
        style={{
          ...s.scrollBtn,
          opacity: canRight ? 1 : 0,
          pointerEvents: canRight ? "auto" : "none",
          flexShrink: 0,
        }}
        aria-label="Scroll right"
        tabIndex={canRight ? 0 : -1}
      >
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// ── Book Card ─────────────────────────────────────────────────────────────────
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

// ── Default Shelf Card ────────────────────────────────────────────────────────
function DefaultShelfCard({ title, icon, path }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      style={{
        ...s.defaultShelfCard,
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered
          ? "0 8px 24px rgba(50,25,5,0.15)"
          : "0 4px 16px rgba(50,25,5,0.08)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(path)}
    >
      <div style={s.shelfIconWrapper}>{icon}</div>
      <p style={s.shelfTitle}>{title}</p>
    </div>
  );
}

// ── Collection Card ───────────────────────────────────────────────────────────
function CollectionCard({ col }) {
  const navigate = useNavigate();
  const placeholderImg = emptyCollectionImg;

  return (
    <div
      style={s.collCard}
      onClick={() => navigate(`/collection/${col._id}`)}
    >
      <div style={s.collCovers}>
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

// ── Create Collection Modal ───────────────────────────────────────────────────
function CreateCollectionModal({ onClose }) {
  const { createCollection } = useBookStore();
  const overlayRef = useRef(null);

  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  useEffect(() => {
    setTimeout(() => nameInputRef.current?.focus(), 60);
  }, []);

  const handleCreate = async () => {
    const trimmed = newName.trim();
    if (!trimmed) { setNameError("Collection name can't be empty."); return; }
    setCreateBusy(true);
    setNameError("");
    const result = await createCollection(trimmed);
    if (result && result.status === "created") {
      onClose();
    } else {
      setNameError(result?.message || "Something went wrong.");
    }
    setCreateBusy(false);
  };

  return (
    <div
      className="atc-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
    >
      <div className="atc-modal" role="dialog" aria-modal="true" style={{ maxWidth: "420px" }}>
        <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(101,67,33,0.15)" }}>
          <h3 style={{ margin: 0, fontFamily: "'Cinzel', serif", fontSize: "18px", color: "#2c1a07" }}>
            Create New Collection
          </h3>
          <button className="atc-close-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="atc-create-body" style={{ padding: "24px" }}>
          <div className="atc-field">
            <label className="atc-label" htmlFor="atc-name-input">Collection name</label>
            <div className={`atc-input-wrap${nameError ? " atc-input-wrap--error" : ""}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" className="atc-input-icon">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <input
                id="atc-name-input"
                ref={nameInputRef}
                className="atc-input"
                type="text"
                placeholder="e.g. Summer Reads…"
                value={newName}
                maxLength={48}
                onChange={(e) => { setNewName(e.target.value); setNameError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter" && newName.trim() && !createBusy) handleCreate(); }}
              />
              {newName && (
                <button className="atc-input-clear" onClick={() => { setNewName(""); setNameError(""); nameInputRef.current?.focus(); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            {nameError && <p className="atc-field-error">{nameError}</p>}
            <p className="atc-char-count">{newName.trim().length} / 48</p>
          </div>
        </div>
        <div className="atc-footer">
          <button className="atc-btn atc-btn--ghost" onClick={onClose}>Cancel</button>
          <button
            className={`atc-btn atc-btn--primary${!newName.trim() ? " atc-btn--disabled" : ""}${createBusy ? " atc-btn--busy" : ""}`}
            onClick={handleCreate}
            disabled={!newName.trim() || createBusy}
          >
            {createBusy ? "Creating…" : "Create Collection"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const { collections, isCollectionsLoading } = useBookStore();
  const [userName, setUserName] = useState("Reader");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

        const booksRes = await fetch("http://localhost:5000/api/books/popular?limit=15", { headers });

        if (!booksRes.ok) {
          throw new Error("API error");
        }

        const booksData = await booksRes.json();
        setBooks(booksData);
        setUserName(localStorage.getItem("first_name") || "Reader");
      } catch (error) {
        console.error("Error fetching data:", error);
        if (error.message === "API error") {
          localStorage.removeItem("token");
          window.location.href = "/login";
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
      {/* Global styles for the scroll track */}
      <style>{`
        .ud-track {
          display: flex !important;
          flex-wrap: nowrap !important;
          overflow-x: auto !important;
          overflow-y: hidden !important;
          gap: 12px;
          padding-bottom: 8px;
          padding-left: 4px;
          padding-right: 4px;
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .ud-track::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Header */}
      <div style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            onClick={() => navigate("/profile")}
            style={s.avatarBtn}
            title="View profile"
          >
            {localStorage.getItem("avatar_url") ? (
              <img
                src={localStorage.getItem("avatar_url")}
                alt={userName}
                style={s.avatarImg}
              />
            ) : (
              <span style={s.avatarInitial}>
                {userName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <h1 style={s.welcomeTitle}>Welcome back, {userName}</h1>
            <p style={s.tagline}>
              <em>A reader lives a thousand lives before he dies.</em>
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div style={s.searchRow}>
        <SearchCatalog books={books} onSearch={(q, results) => console.log("Search:", q, results)} />
      </div>

      {/* Top Books */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Top Books</h2>
        <ScrollRow itemWidth={142}>
          {books.map((b) => (
            <div key={b._id} style={{ flexShrink: 0 }}>
              <BookCard book={b} />
            </div>
          ))}
        </ScrollRow>
      </section>

      {/* My Reading Shelves */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>My Reading Shelves</h2>
        <div className="row g-3" style={{ marginLeft: "44px", marginRight: "44px" }}>
          {[
            {
              title: "Completed",
              path: "/collection/completed",
              icon: (
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ),
            },
            {
              title: "Currently Reading",
              path: "/collection/reading",
              icon: (
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z" />
                </svg>
              ),
            },
            {
              title: "Want to Read",
              path: "/collection/want-to-read",
              icon: (
                <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              ),
            },
          ].map((shelf) => (
            <div key={shelf.title} className="col-12 col-sm-4">
              <DefaultShelfCard title={shelf.title} path={shelf.path} icon={shelf.icon} />
            </div>
          ))}
        </div>
      </section>

      {/* Custom Collections */}
      <section style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Custom Collections</h2>
          <button style={s.createCollectionBtn}
            onClick={() => setIsCreateModalOpen(true)}
          >+ Create Collection</button>
        </div>

        {collections.length === 0 ? (
          <div style={s.emptyCollectionState}>
            <p style={s.emptyCollectionText}>No collections yet. Create one to start organizing your books.</p>
          </div>
        ) : (
          <ScrollRow itemWidth={272}>
            {collections
              .filter(
                (c) =>
                  !["want-to-read", "completed", "reading"].includes(c._id)
              )
              .map((c) => (
                <div key={c._id} style={{ flexShrink: 0 }}>
                  <CollectionCard col={c} />
                </div>
              ))}
          </ScrollRow>
        )}
      </section>

      <div style={s.footerActions}>
        <button style={s.logoutBtn} onClick={handleLogout}>Logout</button>
      </div>

      {isCreateModalOpen && (
        <CreateCollectionModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </PageLayout>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = {
  scrollBtn: {
    background: "#2c1a07",
    color: "#f9edcd",
    border: "none",
    borderRadius: "50%",
    width: "36px",
    height: "36px",
    minWidth: "36px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(50,25,5,0.35)",
    transition: "opacity 0.2s, background 0.2s",
    flexShrink: 0,
  },
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
    borderRadius: "12px",
    border: "2px solid #6b1010",
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
  },
  emptyCollectionText: {
    color: "#6b4c22",
    fontFamily: "'EB Garamond', serif",
    fontSize: "21px",
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

  // ── New Styles for Default Shelves ──
  defaultShelvesRow: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
  },
  defaultShelfCard: {
    width: "100%",
    background: "rgba(255,255,255,0.30)",
    border: "1.5px solid rgba(101,67,33,0.3)",
    borderRadius: "14px",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "16px",
    cursor: "pointer",
    backdropFilter: "blur(2px)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
  },
  shelfIconWrapper: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "rgba(107, 76, 34, 0.08)",
    border: "1.5px solid rgba(101,67,33,0.15)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#4a2e0a",
  },
  shelfTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: "15px",
    fontWeight: 700,
    color: "#2c1a07",
    letterSpacing: "0.05em",
    textAlign: "center",
  },
  bookCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    width: "130px",
    scrollSnapAlign: "start",
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
    padding: "24px 20px 18px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "18px",
    cursor: "pointer",
    backdropFilter: "blur(2px)",
    boxShadow: "0 4px 16px rgba(50,25,5,0.15)",
    transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
    scrollSnapAlign: "start",
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
  avatarBtn: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    overflow: "hidden",
    border: "2.5px solid rgba(101,67,33,0.5)",
    cursor: "pointer",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#2c1a07",
    boxShadow: "0 4px 14px rgba(50,25,5,0.3)",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },
  avatarInitial: {
    fontFamily: "'Cinzel', serif",
    fontSize: "20px",
    fontWeight: 700,
    color: "#f9edcd",
    lineHeight: 1,
    userSelect: "none",
  },
};
