import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
import { useBookStore } from "../context/BookStoreContext";


function BookCard({ book, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const categories = book.genre?.[0] || book.categories?.[0];

  return (
    <div
      style={{
        ...s.bookCard,
        position: "relative",
        transform: hovered ? "translateY(-8px) scale(1.04)" : "none",
        boxShadow: hovered
          ? "0 12px 32px rgba(50,25,5,0.55)"
          : "0 4px 16px rgba(50,25,5,0.25)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/book/${book._id}`)}
    >
      {onDelete && (
        <button
          style={{ ...s.deleteBtn, opacity: hovered ? 1 : 0 }}
          onClick={(e) => { e.stopPropagation(); onDelete(book); }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#f5e4b9" strokeWidth="2" style={{ width: 13, height: 13 }}>
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14H6L5 6" />
            <path d="M10 11v6M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      )}
      <div style={s.coverWrap}>
        <img src={book.cover_image.medium} alt={book.title} style={s.coverImg} />
      </div>
      <p style={s.bookTitle}>{book.title}</p>
      <p style={s.bookAuthor}>{book.author}</p>
      {categories && <span style={s.genreBadge}>{categories}</span>}
    </div>
  );
}

export default function CollectionView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { collections, isCollectionsLoading } = useBookStore();
  const [confirmBook, setConfirmBook] = useState(null);

  const collection = collections.find((c) => c?._id === id);
  const safeBooks = collection?.books?.filter(Boolean) ?? [];

  if (isCollectionsLoading) {
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
            {safeBooks.slice(0, 3).map((b, i) => (
              <img
                key={b._id}
                src={b.cover_image.medium}
                alt={b.title}
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
              {safeBooks.length} book{safeBooks.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={s.divider} />

        {/* Books grid — Bootstrap responsive */}
        {safeBooks.length === 0 ? (
          <div style={s.emptyState}>
            <p style={s.emptyText}>This collection has no books yet.</p>
          </div>
        ) : (
          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
            {safeBooks.map((book) => (
              <div key={book._id} className="col d-flex justify-content-center">
                <BookCard book={book} onDelete={setConfirmBook} />
              </div>
            ))}
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmBook && (
          <div style={s.overlay}>
            <div style={s.modal}>
              <BookCard book={confirmBook} />
              <div style={s.modalRight}>
                <p style={s.modalText}>
                  Are you sure you want to delete{" "}
                  <span style={{ color: "#8b2a2a", fontWeight: 600 }}>"{confirmBook.title}"</span>
                  {" "}from{" "}
                  <span style={{ color: "#2c1a07", fontWeight: 700 }}>"{collection.name}"</span> ?
                </p>
                <div style={s.modalDivider} />
                <div style={s.modalActions}>
                  <button style={s.okayBtn} onClick={() => setConfirmBook(null)}>Okay</button>
                  <button style={s.cancelBtn} onClick={() => setConfirmBook(null)}>Cancel</button>
                </div>
              </div>
            </div>
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
    flexWrap: "wrap",
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
    width: "130px",
  },
  deleteBtn: {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "#5a1a1a",
    border: "none",
    borderRadius: "6px",
    width: "26px",
    height: "26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "opacity 0.2s",
    zIndex: 2,
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
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(20,10,0,0.6)",
    backdropFilter: "blur(3px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "linear-gradient(160deg, #f5e4b9, #ecdba0)",
    border: "2px solid rgba(101,67,33,0.4)",
    borderRadius: "14px",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "24px",
    maxWidth: "360px",
    width: "90%",
    boxShadow: "0 20px 60px rgba(20,10,0,0.5)",
  },
  modalRight: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    flex: 1,
    width: "100%",
  },
  modalText: {
    fontFamily: "'EB Garamond', serif",
    fontSize: "17px",
    color: "#2c1a07",
    lineHeight: 1.6,
    textAlign: "center",
  },
  modalActions: {
    display: "flex",
    gap: "12px",
    justifyContent: "center",
  },
  modalDivider: {
    height: "1px",
    background: "rgba(101,67,33,0.3)",
  },
  okayBtn: {
    background: "#5a1a1a",
    color: "#f5e4b9",
    border: "none",
    borderRadius: "8px",
    padding: "10px 28px",
    fontFamily: "'EB Garamond', serif",
    fontSize: "15px",
    cursor: "pointer",
  },
  cancelBtn: {
    background: "transparent",
    color: "#2c1a07",
    border: "1.5px solid rgba(101,67,33,0.4)",
    borderRadius: "8px",
    padding: "10px 28px",
    fontFamily: "'EB Garamond', serif",
    fontSize: "15px",
    cursor: "pointer",
  },
};
