import { useState } from "react";
import React from "react";
import SearchCatalog from "./SearchCatalog";
import PageLayout from "./PageLayout";

// ── Sample data ────────────────────────────────────────────────────────────────
const TOP_BOOKS = [
  { id: 1, title: "The Alchemist", author: "Paulo Coelho", cover: "https://covers.openlibrary.org/b/id/8739161-L.jpg" },
  { id: 2, title: "1984", author: "George Orwell", cover: "https://covers.openlibrary.org/b/id/7222246-L.jpg" },
  { id: 3, title: "The Hobbit", author: "J.R.R. Tolkien", cover: "https://covers.openlibrary.org/b/id/9255566-L.jpg" },
  { id: 4, title: "Atomic Habits", author: "James Clear", cover: "https://covers.openlibrary.org/b/id/10527107-L.jpg" },
  { id: 5, title: "The 5 AM Club", author: "Robin Sharma", cover: "https://covers.openlibrary.org/b/id/8739368-L.jpg" },
  { id: 6, title: "Dune", author: "Frank Herbert", cover: "https://covers.openlibrary.org/b/id/10921787-L.jpg" },
];

const COLLECTIONS = [
  { id: 1, name: "Collection 1", books: [TOP_BOOKS[2], TOP_BOOKS[1], TOP_BOOKS[0], TOP_BOOKS[3]] },
  { id: 2, name: "Collection 2", books: [TOP_BOOKS[3], TOP_BOOKS[0]] },
  { id: 3, name: "Collection 3", books: [TOP_BOOKS[4], TOP_BOOKS[5]] },
  { id: 4, name: "Collection 4", books: [TOP_BOOKS[5], TOP_BOOKS[4]] },
  { id: 5, name: "Collection 5", books: [TOP_BOOKS[0], TOP_BOOKS[1]] }
];

// ── Sub-components ─────────────────────────────────────────────────────────────
function BookCard({ book }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{ ...s.bookCard, transform: hovered ? "translateY(-6px) scale(1.03)" : "none", transition: "transform 0.25s ease" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={s.coverWrap}>
        <img src={book.cover} alt={book.title} style={s.coverImg} />
      </div>
      <p style={s.bookTitle}>{book.title}</p>
      <p style={s.bookAuthor}>{book.author}</p>
    </div>
  );
}

function CollectionCard({ col }) {
  return (
    <div style={s.collCard}>
      <div style={s.collCovers}>
        {col.books.slice(0, 2).map((b, i) => (
          <img
            key={b.id}
            src={b.cover}
            alt={b.title}
            style={{
              ...s.collCover,
              left: `${i * 38}px`,
              zIndex: i === 0 ? 1 : 2,
              transform: i === 0 ? "rotate(-6deg)" : "rotate(3deg)",
            }}
          />
        ))}
      </div>
      <p style={s.collName}>{col.name}</p>
    </div>
  );
}

function ScrollRow({ children, itemWidth = 160, visibleCount = 4 }) {
  const [index, setIndex] = useState(0);
  const items = React.Children.toArray(children);
  const total = items.length;

  const prev = () => setIndex(i => (i - 1 + total) % total);
  const next = () => setIndex(i => (i + 1) % total);

  const visible = Array.from({ length: Math.min(visibleCount, total) }, (_, k) => items[(index + k) % total]);

  return (
    <div style={s.rowOuter}>
      <button style={s.arrowBtn} onClick={prev}>&#8249;</button>
      <div style={s.rowViewport}>
        <div style={s.rowTrack}>
          {visible}
        </div>
      </div>
      <button style={s.arrowBtn} onClick={next}>&#8250;</button>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function UserDashboard() {
  const userName = "John";

  return (
    <PageLayout>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.welcomeTitle}>Welcome back, {userName}</h1>
          <p style={s.tagline}><em>A reader lives a thousand lives before he dies.</em></p>
        </div>
      </div>

      {/* Search */}
      <div style={s.searchRow}>
        <SearchCatalog onSearch={(q) => console.log("Search:", q)} />
      </div>

      {/* Top Books */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>Top Books</h2>
        <ScrollRow itemWidth={140} visibleCount={6}>
          {TOP_BOOKS.map(b => <BookCard key={b.id} book={b} />)}
        </ScrollRow>

      </section>

      {/* My Collections */}
      <section style={s.section}>
        <h2 style={s.sectionTitle}>My Collections</h2>
        <ScrollRow itemWidth={260} visibleCount={3}>
          {COLLECTIONS.map(c => <CollectionCard key={c.id} col={c} />)}
        </ScrollRow>
      </section>
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
  searchRow: {
    display: "flex",
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
};
