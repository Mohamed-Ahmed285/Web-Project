import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import { TOP_BOOKS } from "../data/books";
import { useBookStore } from "../context/BookStoreContext";

// ── Static seed data (used only by BookStoreContext to initialise state) ───────
export const COLLECTIONS = [
  { id: 1, name: "Collection 1", books: [TOP_BOOKS[2], TOP_BOOKS[1], TOP_BOOKS[0], TOP_BOOKS[3]] },
  { id: 2, name: "Collection 2", books: [TOP_BOOKS[3], TOP_BOOKS[0]] },
  { id: 3, name: "Collection 3", books: [TOP_BOOKS[4], TOP_BOOKS[5]] },
  { id: 4, name: "Collection 4", books: [TOP_BOOKS[5], TOP_BOOKS[4]] },
  { id: 5, name: "Collection 5", books: [TOP_BOOKS[0], TOP_BOOKS[1]] },
];

function BookCard({ book }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      style={{
        ...s.bookCard,
        transform: hovered ? "translateY(-8px) scale(1.04)" : "none",
        boxShadow: hovered
          ? "0 12px 32px rgba(50,25,5,0.55)"
          : "0 4px 16px rgba(50,25,5,0.25)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/book/${book.id}`)}
    >
      <div style={s.coverWrap}>
        <img src={book.cover} alt={book.title} style={s.coverImg} />
      </div>
      <p style={s.bookTitle}>{book.title}</p>
      <p style={s.bookAuthor}>{book.author}</p>
      {book.genre && <span style={s.genreBadge}>{book.genre}</span>}
    </div>
  );
}

export default function CollectionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const collectionId = Number(id);
  const { collections } = useBookStore();

  const collection = collections.find((c) => c.id === collectionId);

  if (!collection) {
    return (
      <PageLayout>
        <div style={s.notFound}>
          <p style={s.notFoundText}>Collection not found.</p>
          <button style={s.backBtn} onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div style={s.page}>
        {/* Back button */}
        <button style={s.backBtn} onClick={() => navigate("/dashboard")}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{ width: 16, height: 16 }}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Dashboard
        </button>

        {/* Header */}
        <div style={s.header}>
          <div style={s.collectionIconRow}>
            {collection.books.slice(0, 3).map((b, i) => (
              <img
                key={b.id}
                src={b.cover}
                alt=""
                style={{
                  ...s.headerThumb,
                  left: `${i * 30}px`,
                  zIndex: i + 1,
                  transform: `rotate(${[-8, 0, 6][i] ?? 0}deg)`,
                }}
              />
            ))}
          </div>
          <div style={s.headerText}>
            <h1 style={s.collectionTitle}>{collection.name}</h1>
            <p style={s.bookCount}>
              {collection.books.length} book{collection.books.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={s.divider} />

        {/* Books grid */}
        {collection.books.length === 0 ? (
          <div style={s.emptyState}>
            <p style={s.emptyText}>This collection has no books yet.</p>
          </div>
        ) : (
          <div style={s.grid}>
            {collection.books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    background: "rgba(255,255,255,0.18)",
    border: "1.5px solid rgba(101,67,33,0.4)",
    borderRadius: "8px",
    padding: "7px 16px",
    fontFamily: "'EB Garamond', serif",
    fontSize: "14px",
    color: "#4a2e0a",
    cursor: "pointer",
    transition: "background 0.2s",
    alignSelf: "flex-start",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "40px",
    marginTop: "4px",
  },
  collectionIconRow: {
    position: "relative",
    width: "110px",
    height: "90px",
    flexShrink: 0,
  },
  headerThumb: {
    position: "absolute",
    width: "60px",
    height: "85px",
    objectFit: "cover",
    borderRadius: "5px",
    boxShadow: "3px 5px 14px rgba(30,15,0,0.5)",
    border: "1.5px solid rgba(101,67,33,0.3)",
    transition: "transform 0.2s",
  },
  headerText: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  collectionTitle: {
    fontFamily: "'Cinzel', 'EB Garamond', serif",
    fontSize: "clamp(22px, 3vw, 32px)",
    fontWeight: 700,
    color: "#2c1a07",
    letterSpacing: "0.03em",
    lineHeight: 1.2,
  },
  bookCount: {
    fontFamily: "'EB Garamond', serif",
    fontSize: "15px",
    color: "#7a5c2e",
    fontStyle: "italic",
  },
  divider: {
    height: "1.5px",
    background: "linear-gradient(to right, rgba(101,67,33,0.5), rgba(101,67,33,0.05))",
    borderRadius: "2px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
    gap: "28px 20px",
    paddingBottom: "32px",
  },
  bookCard: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "9px",
    cursor: "pointer",
    transition: "transform 0.25s ease, box-shadow 0.25s ease",
    borderRadius: "8px",
    padding: "10px 6px 12px",
    background: "rgba(255,255,255,0.10)",
    border: "1px solid rgba(101,67,33,0.15)",
    backdropFilter: "blur(2px)",
  },
  coverWrap: {
    width: "100px",
    height: "145px",
    borderRadius: "6px",
    overflow: "hidden",
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
    fontFamily: "'EB Garamond', serif",
  },
  bookAuthor: {
    fontSize: "12px",
    color: "#7a5c2e",
    textAlign: "center",
    fontFamily: "'EB Garamond', serif",
  },
  genreBadge: {
    fontSize: "10px",
    background: "rgba(101,67,33,0.15)",
    border: "1px solid rgba(101,67,33,0.3)",
    borderRadius: "20px",
    padding: "2px 8px",
    color: "#5a3a10",
    fontFamily: "'EB Garamond', serif",
    textAlign: "center",
    maxWidth: "110px",
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
  },
  notFound: {
    padding: "60px 0",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  notFoundText: {
    fontFamily: "'Cinzel', serif",
    color: "#6b4c22",
    fontSize: "18px",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 0",
  },
  emptyText: {
    fontFamily: "'EB Garamond', serif",
    fontSize: "16px",
    color: "#7a5c2e",
    fontStyle: "italic",
  },
};
