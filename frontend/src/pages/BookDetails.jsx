import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, redirect } from "react-router-dom";
import PageLayout from "./PageLayout";
import { TOP_BOOKS } from "../data/books";
import { useBookStore } from "../context/BookStoreContext";
import "./BookDetails.css";

// ── Star display (read-only, supports decimals) ───────────────────────────────
function StarsDisplay({ rating, size = 18 }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <div className="bd-stars-display">
      {Array.from({ length: 5 }, (_, i) => {
        const filled = i < full || (i === full && half);
        return (
          <span
            key={i}
            className={`star${filled ? "" : " empty"}`}
            style={{ fontSize: size }}
          >
            {filled ? "★" : "☆"}
          </span>
        );
      })}
    </div>
  );
}

// ── Star rating input (interactive hover + click) ────────────────────────────
function StarRatingInput({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="bd-user-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          className={n <= (hovered || value) ? "filled" : ""}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// ── Add-to-Collection Modal ───────────────────────────────────────────────────
// view: "list" → browse & pick existing  |  "create" → name + instant-add
function AddToCollectionModal({ book, onClose }) {
  const { addBookToCollection, createCollection } = useBookStore();

  const [collections, setCollections] = useState([]);
  const [isFetching, setIsFetching] = useState(true);

  /* ── shared ── */
  const overlayRef = useRef(null);
  const [view, setView] = useState("list"); // "list" | "create"
  const [toast, setToast] = useState(null); // { type, msg } — floats above everything

  /* ── list-view state ── */
  const [selected, setSelected] = useState(null);
  const [listBusy, setListBusy] = useState(false);

  /* ── create-view state ── */
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const nameInputRef = useRef(null);


  // fetch collections
  useEffect(() => {
    const fetchCollections = async () => {
      setIsFetching(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const res = await fetch(`http://localhost:5000/api/collections/${book._id}`, { headers });
        if (!res.ok) throw new Error("Failed to fetch collections");

        const data = await res.json();
        setCollections(data);
      } catch (error) {
        if (error.message === "No token") {
          localStorage.removeItem("token");
          redirect("/login");
        }
        console.error("Error fetching collections:", error);
      } finally {
        setIsFetching(false);
      }
    };

    fetchCollections();
  }, []);

  /* ── close on Escape ── */
  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  /* ── focus name input when switching to create view ── */
  useEffect(() => {
    if (view === "create") setTimeout(() => nameInputRef.current?.focus(), 60);
  }, [view]);

  /* ── auto-dismiss toast ── */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  /* ──────────────── handlers ──────────────── */
  const handleAddToExisting = async () => {
    if (!selected || listBusy) return;

    setListBusy(true);

    const col = collections.find((c) => c.id === selected);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/collections/addBook/${selected}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ bookId: book._id }),
        }
      );

      const data = await response.json();

      if (
        response.status === 400 &&
        data.message === "Book already in collection"
      ) {
        setToast({
          type: "warn",
          msg: `"${book.title}" is already in "${col?.name}".`,
        });
        return;
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to add book");
      }

      setToast({
        type: "success",
        msg: `Added to "${col?.name}" ✓`,
      });

      setTimeout(onClose, 1500);
    } catch (error) {
      console.error("Error adding book to collection:", error);

      setToast({
        type: "warn",
        msg: "Something went wrong. Try again.",
      });
    } finally {
      setListBusy(false);
    }
  };


  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) {
      setNameError("Collection name can't be empty.");
      return;
    }
    const duplicate = collections.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (duplicate) {
      setNameError(`A collection named "${trimmed}" already exists.`);
      return;
    }
    setCreateBusy(true);
    const result = createCollection(trimmed, book);
    if (result.status === "duplicate_name") {
      setNameError(`A collection named "${trimmed}" already exists.`);
      setCreateBusy(false);
      return;
    }
    setToast({ type: "success", msg: `"${trimmed}" created & book added ✓` });
    setTimeout(onClose, 1600);
  };

  const switchToCreate = () => {
    setView("create");
    setNewName("");
    setNameError("");
  };

  const switchToList = () => {
    setView("list");
    setNameError("");
  };

  /* ──────────────── shared book-header snippet ──────────────── */
  const BookHeader = () => (
    <div className="atc-header">
      <div className="atc-header-book">
        <img src={book.cover_image.medium} alt={book.title} className="atc-thumb" />
        <div>
          <p className="atc-header-eyebrow">Add to collection</p>
          <p className="atc-header-title">{book.title}</p>
          <p className="atc-header-author">by {book.author}</p>
        </div>
      </div>
      <button className="atc-close-btn" onClick={onClose} aria-label="Close">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          width="14"
          height="14"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );

  /* ──────────────── render ──────────────── */
  return (
    <div
      className="atc-overlay"
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      {/* Floating toast */}
      {toast && (
        <div className={`atc-toast atc-toast--${toast.type}`}>{toast.msg}</div>
      )}

      <div className="atc-modal" role="dialog" aria-modal="true">
        {/* ══════════ LIST VIEW ══════════ */}
        {view === "list" && (
          <>
            <BookHeader />
            <div className="atc-divider" />

            {/* Tab-style switcher */}
            <div className="atc-tabs">
              <button className="atc-tab atc-tab--active">Existing</button>
              <button className="atc-tab" onClick={switchToCreate}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  width="11"
                  height="11"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Collection
              </button>
            </div>

            {/* Collection list */}
            <div className="atc-list">
              {isFetching ? (
                <div className="atc-empty-state"><p>Loading collections...</p></div>
              ) : collections.length === 0 ? (
                <div className="atc-empty-state">
                  <p>No collections yet.</p>
                  <button className="atc-empty-cta" onClick={switchToCreate}>
                    Create one →
                  </button>
                </div>
              ) : (
                collections.map((col) => {
                  const alreadyIn = col.alreadyIn;
                  const isSelected = selected === col.id;

                  return (
                    <button
                      key={col.id}
                      className={[
                        "atc-row",
                        isSelected ? "atc-row--selected" : "",
                        alreadyIn ? "atc-row--has-book" : "",
                      ].join(" ").trim()}
                      onClick={() => {
                        if (alreadyIn) return;
                        setSelected(col.id);
                      }}
                    >
                      {col.img && (
                        <div className="atc-covers">
                          <img
                            src={col.img}
                            alt={col.name}
                            className="atc-cover-img"
                            style={{ position: "relative", left: 0, transform: "none", zIndex: 1 }}
                          />
                        </div>
                      )}

                      <div className="atc-row-info">
                        <span className="atc-row-name">{col.name}</span>
                        <span className="atc-row-meta">
                          {col.bookCount} book{col.bookCount !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="atc-row-right">
                        {alreadyIn ? (
                          <span className="atc-badge atc-badge--in">In collection</span>
                        ) : isSelected ? (
                          <span className="atc-badge atc-badge--selected">✓ Selected</span>
                        ) : (
                          <span className="atc-badge atc-badge--idle">Select</span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {/* Footer */}
            <div className="atc-footer">
              <button className="atc-btn atc-btn--ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                className={`atc-btn atc-btn--primary${!selected ? " atc-btn--disabled" : ""}${listBusy ? " atc-btn--busy" : ""}`}
                onClick={handleAddToExisting}
                disabled={!selected || listBusy}
              >
                Add to Collection
              </button>
            </div>
          </>
        )}

        {/* ══════════ CREATE VIEW ══════════ */}
        {view === "create" && (
          <>
            <BookHeader />
            <div className="atc-divider" />

            {/* Tab-style switcher */}
            <div className="atc-tabs">
              <button className="atc-tab" onClick={switchToList}>
                Existing
              </button>
              <button className="atc-tab atc-tab--active">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  width="11"
                  height="11"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                New Collection
              </button>
            </div>

            <div className="atc-create-body">
              {/* Visual: book going into a new shelf */}
              <div className="atc-create-visual">
                <div className="atc-create-shelf">
                  <img src={book.cover_image.medium} alt="" className="atc-create-cover" />
                  <div className="atc-create-shelf-line" />
                </div>
                <p className="atc-create-hint">
                  A new collection will be created and this book will be added
                  to it.
                </p>
              </div>

              {/* Name field */}
              <div className="atc-field">
                <label className="atc-label" htmlFor="atc-name-input">
                  Collection name
                </label>
                <div
                  className={`atc-input-wrap${nameError ? " atc-input-wrap--error" : ""}`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    width="14"
                    height="14"
                    className="atc-input-icon"
                  >
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                  <input
                    id="atc-name-input"
                    ref={nameInputRef}
                    className="atc-input"
                    type="text"
                    placeholder="e.g. Favourites, Summer Reads…"
                    value={newName}
                    maxLength={48}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setNameError("");
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleCreate();
                    }}
                  />
                  {newName && (
                    <button
                      className="atc-input-clear"
                      onClick={() => {
                        setNewName("");
                        setNameError("");
                        nameInputRef.current?.focus();
                      }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        width="12"
                        height="12"
                      >
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
                {nameError && <p className="atc-field-error">{nameError}</p>}
                <p className="atc-char-count">{newName.trim().length} / 48</p>
              </div>

              {/* Existing names hint */}
              {collections.length > 0 && (
                <div className="atc-existing-names">
                  <span className="atc-existing-label">Existing:</span>
                  {collections.map((c) => (
                    <span key={c.id} className="atc-existing-chip">
                      {c.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="atc-footer">
              <button className="atc-btn atc-btn--ghost" onClick={switchToList}>
                ← Back
              </button>
              <button
                className={`atc-btn atc-btn--primary${!newName.trim() ? " atc-btn--disabled" : ""}${createBusy ? " atc-btn--busy" : ""}`}
                onClick={handleCreate}
                disabled={!newName.trim() || createBusy}
              >
                {createBusy ? "Creating…" : "Create & Add Book"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const bookId = id;

  const [toast, setToast] = useState(null);

  // reviews
  const [comments, setComments] = useState([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // track reading status
  const [readingStatus, setReadingStatus] = useState(null);
  const [isStatusLoading, setIsStatusLoading] = useState(false);

  const [rawBook, setRawBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Context (per-book persistent store) ──────────────────────────────────
  const { getBook, patchBook, addReview, getAvgRating, getTotalReviews } =
    useBookStore();
  const bookData = getBook(bookId);

  const [reviewText, setReviewText] = useState("");
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    const fetchComments = async () => {
      setIsCommentsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(`http://localhost:5000/api/user-books/reviews/${bookId}`, { headers });

        if (!response.ok) throw new Error("Failed to fetch comments");

        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error("Error fetching comments:", error);
      } finally {
        setIsCommentsLoading(false);
      }
    };

    fetchComments();
  }, [bookId]);

  useEffect(() => {
    const fetchBook = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No token");

        const headers = {
          Authorization: `Bearer ${token}`,
        };
        // Fetch book details
        const response = await fetch(
          `http://localhost:5000/api/books/${bookId}`,
          { headers },
        );
        if (!response.ok) {
          throw new Error("Book not found or server error");
        }
        const data = await response.json();

        // Fetch user's reading status for this book
        const statusResponse = await fetch(`http://localhost:5000/api/user-books/status/${bookId}`, { headers });
        if (statusResponse.ok) {
          const statusData = await statusResponse.json();
          setReadingStatus(statusData);
        }

        // fetch user rating for this movie
        const ratingResponse = await fetch(`http://localhost:5000/api/user-books/rate/${bookId}`, { headers });
        if (ratingResponse.ok) {
          const ratingData = await ratingResponse.json();
          patchBook(bookId, { userRating: ratingData });
        }

        setRawBook(data);
      } catch (err) {
        if (err.message === "No token") {
          localStorage.removeItem("token");
          navigate("/login");
        }
        console.error("Failed to fetch book:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);


  const handleStatusChange = async (key) => {
    const newStatus = readingStatus === key ? null : key;

    const previousStatus = readingStatus;
    setReadingStatus(newStatus);
    setIsStatusLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/user-books/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId, status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status in DB");
      }

      // ADD THIS: Success toast
      setToast({
        type: "success",
        msg: newStatus ? "Reading status updated ✓" : "Reading status cleared ✓",
      });

    } catch (error) {
      console.error("Error updating status:", error);
      setReadingStatus(previousStatus);
      setToast({
        type: "warn",
        msg: "Failed to update reading status. Please try again.",
      });
    } finally {
      setIsStatusLoading(false);
    }
  };


  // Handle Loading & Error States
  if (isLoading) {
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

  if (error || !rawBook) {
    return (
      <PageLayout>
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "'Cinzel', serif",
              color: "#6b4c22",
              fontSize: "18px",
            }}
          >
            {error || "Book not found."}
          </p>
          <button
            className="bd-back-btn"
            style={{ margin: "20px auto" }}
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </PageLayout>
    );
  }

  // Map backend model to frontend expectations so we don't break the JSX
  const book = {
    ...rawBook,
    id: rawBook._id,
    cover: rawBook.cover_image,
    genre:
      rawBook.categories && rawBook.categories.length > 0
        ? rawBook.categories
        : ["General"],
    publishDate: rawBook.published_year,
    description: rawBook.description || "No description provided.",
    language: rawBook.language || "English",
    relatedIds: rawBook.relatedIds || [],
    rating: rawBook.rating || 0,
    totalComments: rawBook.total_comments || 0,
  };

  // const book = TOP_BOOKS.find((b) => b.id === bookId);

  if (!book) {
    return (
      <PageLayout>
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "'Cinzel', serif",
              color: "#6b4c22",
              fontSize: "18px",
            }}
          >
            Book not found.
          </p>
          <button
            className="bd-back-btn"
            style={{ margin: "20px auto" }}
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>
        </div>
      </PageLayout>
    );
  }

  // Live computed values from context
  // const avgRating = getAvgRating(bookId);
  // const totalReviews = getTotalReviews(bookId);
  const relatedBooks = book.relatedIds
    .map((rid) => TOP_BOOKS.find((b) => b.id === rid))
    .filter(Boolean);

  const handleSubmitReview = async () => {
    // if it didn't change
    if (!reviewText && !bookData.userRating) return;

    setIsSubmittingReview(true);

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`http://localhost:5000/api/user-books/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: bookId,
          rate: bookData.userRating || null,
          comment: reviewText.trim(),
        }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      const newCommentData = await response.json();

      if (reviewText.trim()) {
        const formattedNewComment = {
          comment: reviewText.trim(),
          rate: bookData.userRating || null,
          first_name: localStorage.getItem("first_name") || "You",
          second_name: localStorage.getItem("second_name") || "",
          createdAt: newCommentData.createdAt || new Date().toISOString(),
          isTheUser: true,
        };

        setComments((prev) => [formattedNewComment, ...prev]);
        setReviewText("");
      }

      setToast({ type: "success", msg: "Review submitted ✓" });

    } catch (error) {
      console.error("Error submitting review:", error);
      setToast({ type: "warn", msg: "Failed to submit review. Try again." });
    } finally {
      setIsSubmittingReview(false);
    }
  };


  const STATUS_OPTIONS = [
    { key: "completed", label: "✓ Completed" },
    { key: "reading", label: "📖 Currently Reading" },
    { key: "want-to-read", label: "🔖 Want to Read" },
  ];

  const DETAIL_CELLS = [
    { label: "Published", value: book.publishDate },
    { label: "Pages", value: book.pages },
    { label: "Language", value: book.language },
    // { label: "ISBN", value: book.isbn },
  ];

  return (
    <PageLayout>

      {toast && (
        <div className={`atc-toast atc-toast--${toast.type}`} style={{ position: "fixed", zIndex: 9999 }}>
          {toast.msg}
        </div>
      )}

      <div className="bd-page">
        {/* ── Back button ── */}
        <button className="bd-back-btn" onClick={() => navigate("/dashboard")}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Dashboard
        </button>

        {/* ── Hero ── */}
        <div className="bd-hero">
          <div className="bd-cover-wrap">
            <img src={book.cover_image.medium} alt={book.title} />
          </div>
          <div className="bd-meta">
            <h1 className="bd-title">{book.title}</h1>
            <p className="bd-author">by {book.author}</p>

            {/* Map over the array to create separate badges */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px" }}>
              {book.genre.map((category, index) => (
                <span key={index} className="bd-genre-badge">
                  {category}
                </span>
              ))}
            </div>

            {/* Live per-book rating row */}
            <div className="bd-rating-row">
              <StarsDisplay rating={book.rating} />
              <span className="bd-rating-num">{Number(book.rating).toFixed(1)}</span>
              <span className="bd-reviews-count">
                ({book.totalComments.toLocaleString()} review
                {book.totalComments !== 1 ? "s" : ""})
              </span>
            </div>

            <p className="bd-description">{book.description}</p>
          </div>
        </div>

        {/* ── Book Details Grid ── */}
        <div>
          <p className="bd-section-heading">Book Details</p>
          <div className="bd-details-grid">
            {DETAIL_CELLS.map(({ label, value }) => (
              <div key={label} className="bd-detail-cell">
                <span className="bd-detail-label">{label}</span>
                <span className="bd-detail-value">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Actions panel ── */}
        <div className="bd-actions-panel">
          {/* Add to Collection */}
          <div>
            <p
              className="bd-section-heading"
              style={{ borderBottom: "none", marginBottom: "12px" }}
            >
              My Collections
            </p>
            <button
              className="bd-add-to-collection-btn"
              onClick={() => setShowCollectionModal(true)}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                style={{ width: 15, height: 15, flexShrink: 0 }}
              >
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              Add to Collection
            </button>
          </div>

          {/* Reading status — persisted per book */}
          <div>
            <p
              className="bd-section-heading"
              style={{ borderBottom: "none", marginBottom: "12px" }}
            >
              Reading Status
            </p>
            <div className="bd-status-group">
              {STATUS_OPTIONS.map(({ key, label }) => {
                const isUnselected = readingStatus && readingStatus !== key;

                return (
                  <button
                    key={key}
                    disabled={isStatusLoading}
                    className={`bd-status-btn${readingStatus === key ? " active" : ""}`}
                    onClick={() => handleStatusChange(key)}
                    style={{
                      opacity: isStatusLoading ? 0.6 : (isUnselected ? 0.4 : 1),
                      transition: "opacity 0.2s ease"
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Star rating — persisted per book */}
          <div>
            <p
              className="bd-section-heading"
              style={{ borderBottom: "none", marginBottom: "12px" }}
            >
              Your Rating
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <StarRatingInput
                value={bookData.userRating}
                onChange={(n) => patchBook(bookId, { userRating: n })}
              />
              {bookData.userRating > 0 && (
                <span
                  style={{
                    fontFamily: "'EB Garamond', serif",
                    fontSize: "15px",
                    color: "#6b4c22",
                  }}
                >
                  {bookData.userRating} / 5 stars
                </span>
              )}
            </div>
          </div>

          {/* Write review */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <p
              className="bd-section-heading"
              style={{ borderBottom: "none", marginBottom: "0" }}
            >
              Write a Review
            </p>
            <textarea
              className="bd-review-textarea"
              placeholder="Share your thoughts about this book…"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button
              className="bd-review-submit-btn"
              onClick={handleSubmitReview}
              disabled={isSubmittingReview}
              style={{ opacity: isSubmittingReview ? 0.6 : 1 }}
            >
              {isSubmittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </div>

        <div>
          <p className="bd-section-heading">
            Reader Reviews
            {comments.length > 0 && (
              <span
                style={{
                  fontFamily: "'EB Garamond', serif",
                  fontWeight: 400,
                  fontSize: "14px",
                  marginLeft: "8px",
                  color: "#7a5c2e",
                }}
              >
                ({comments.length} submitted)
              </span>
            )}
          </p>

          {isCommentsLoading ? (
            <p className="bd-no-reviews">Loading reviews...</p>
          ) : comments.length === 0 ? (
            <p className="bd-no-reviews">
              No reviews yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="bd-reviews-list">
              {comments.map((rev, index) => (
                /* Using index as a fallback key since the backend doesn't send a unique ID per comment */
                <div key={index} className="bd-review-card">
                  <div className="bd-review-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                    <div>
                      {/* Name */}
                      <span className="bd-review-user" style={{ fontWeight: "bold" }}>
                        {rev.first_name} {rev.second_name}
                        {rev.isTheUser && " (You)"}
                      </span>

                      {/* Date */}
                      {rev.createdAt && (
                        <span
                          className="bd-review-date"
                          style={{ fontSize: "13px", color: "#6d6d6d", marginLeft: "10px" }}
                        >
                          {new Date(rev.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      )}
                    </div>

                    {/* Stars */}
                    {rev.rate > 0 && (
                      <div className="bd-review-mini-stars">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span
                            key={n}
                            className={`star${n <= rev.rate ? "" : " empty"}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className="bd-review-text">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Related Books ── */}
        {relatedBooks.length > 0 && (
          <div>
            <p className="bd-section-heading">Related Books</p>
            <div className="bd-related-row">
              {relatedBooks.map((rb) => (
                <div
                  key={rb.id}
                  className="bd-related-card"
                  onClick={() => navigate(`/book/${rb.id}`)}
                >
                  <div className="bd-related-cover">
                    <img src={rb.cover_image.medium} alt={rb.title} />
                  </div>
                  <p className="bd-related-title">{rb.title}</p>
                  <p className="bd-related-author">{rb.author}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Add to Collection Modal ── */}
      {showCollectionModal && (
        <AddToCollectionModal
          book={book}
          onClose={() => setShowCollectionModal(false)}
        />
      )}
    </PageLayout>
  );
}
const s = {
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
}