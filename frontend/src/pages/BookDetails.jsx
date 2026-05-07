import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";
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
          <span key={i} className={`star${filled ? "" : " empty"}`} style={{ fontSize: size }}>
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

function BookHeader({ book, onClose }) {
  return (
    <div className="atc-header">
      <div className="atc-header-book">
        <img src={book.cover} alt={book.title} className="atc-thumb" />
        <div>
          <p className="atc-header-eyebrow">Add to collection</p>
          <p className="atc-header-title">{book.title}</p>
          <p className="atc-header-author">by {book.author}</p>
        </div>
      </div>
      <button className="atc-close-btn" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  );
}

// ── Add-to-Collection Modal ───────────────────────────────────────────────────
// view: "list" → browse & pick existing  |  "create" → name + instant-add
function AddToCollectionModal({ book, onClose }) {
  const { collections, addBookToCollection, createCollection } = useBookStore();

  /* ── shared ── */
  const overlayRef = useRef(null);
  const [view, setView]         = useState("list");   // "list" | "create"
  const [toast, setToast]       = useState(null);     // { type, msg } — floats above everything

  /* ── list-view state ── */
  const [selected, setSelected] = useState(null);
  const [listBusy, setListBusy] = useState(false);

  /* ── create-view state ── */
  const [newName, setNewName]       = useState("");
  const [nameError, setNameError]   = useState("");
  const [createBusy, setCreateBusy] = useState(false);
  const nameInputRef = useRef(null);

  /* ── close on Escape ── */
  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
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
  const handleAddToExisting = () => {
    if (!selected || listBusy) return;
    setListBusy(true);
    const outcome = addBookToCollection(selected, book);
    const col = collections.find((c) => c.id === selected);
    if (outcome === "duplicate") {
      setToast({ type: "warn", msg: `"${book.title}" is already in "${col?.name}".` });
    } else {
      setToast({ type: "success", msg: `Added to "${col?.name}" ✓` });
      setTimeout(onClose, 1500);
      return;
    }
    setListBusy(false);
  };

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (!trimmed) { setNameError("Collection name can't be empty."); return; }
    const duplicate = collections.some(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) { setNameError(`A collection named "${trimmed}" already exists.`); return; }
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

  /* ──────────────── render ──────────────── */
  return (
    <div
      className="atc-overlay"
      ref={overlayRef}
      onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Collection
              </button>
            </div>

            {/* Collection list */}
            <div className="atc-list">
              {collections.length === 0 ? (
                <div className="atc-empty-state">
                  <p>No collections yet.</p>
                  <button className="atc-empty-cta" onClick={switchToCreate}>Create one →</button>
                </div>
              ) : (
                collections.map((col) => {
                  const alreadyIn  = col.books.some((b) => b.id === book.id);
                  const isSelected = selected === col.id;
                  return (
                    <button
                      key={col.id}
                      className={[
                        "atc-row",
                        isSelected  ? "atc-row--selected"  : "",
                        alreadyIn   ? "atc-row--has-book"  : "",
                      ].join(" ").trim()}
                      onClick={() => {
                        if (alreadyIn) return;
                        setSelected(col.id);
                      }}
                    >
                      {/* stacked mini covers */}
                      <div className="atc-covers">
                        {col.books.length === 0 ? (
                          <div className="atc-covers-empty">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="18" height="18">
                              <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
                            </svg>
                          </div>
                        ) : (
                          col.books.slice(0, 2).map((b, i) => (
                            <img
                              key={b.id} src={b.cover} alt=""
                              className="atc-cover-img"
                              style={{ left: `${i * 15}px`, zIndex: i + 1, transform: `rotate(${i === 0 ? -6 : 5}deg)` }}
                            />
                          ))
                        )}
                      </div>

                      <div className="atc-row-info">
                        <span className="atc-row-name">{col.name}</span>
                        <span className="atc-row-meta">
                          {col.books.length} book{col.books.length !== 1 ? "s" : ""}
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
              <button className="atc-btn atc-btn--ghost" onClick={onClose}>Cancel</button>
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
              <button className="atc-tab" onClick={switchToList}>Existing</button>
              <button className="atc-tab atc-tab--active">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="11" height="11">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                New Collection
              </button>
            </div>

            <div className="atc-create-body">

              {/* Visual: book going into a new shelf */}
              <div className="atc-create-visual">
                <div className="atc-create-shelf">
                  <img src={book.cover} alt="" className="atc-create-cover" />
                  <div className="atc-create-shelf-line" />
                </div>
                <p className="atc-create-hint">
                  A new collection will be created and this book will be added to it.
                </p>
              </div>

              {/* Name field */}
              <div className="atc-field">
                <label className="atc-label" htmlFor="atc-name-input">Collection name</label>
                <div className={`atc-input-wrap${nameError ? " atc-input-wrap--error" : ""}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14" className="atc-input-icon">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                  </svg>
                  <input
                    id="atc-name-input"
                    ref={nameInputRef}
                    className="atc-input"
                    type="text"
                    placeholder="e.g. Favourites, Summer Reads…"
                    value={newName}
                    maxLength={48}
                    onChange={(e) => { setNewName(e.target.value); setNameError(""); }}
                    onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
                  />
                  {newName && (
                    <button className="atc-input-clear" onClick={() => { setNewName(""); setNameError(""); nameInputRef.current?.focus(); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="12" height="12">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
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
                    <span key={c.id} className="atc-existing-chip">{c.name}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="atc-footer">
              <button className="atc-btn atc-btn--ghost" onClick={switchToList}>← Back</button>
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

  // ── Context (per-book persistent store) ──────────────────────────────────
  const { getBook, patchBook, addReview } = useBookStore();
  const bookData = getBook(bookId);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Authentication required.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`http://localhost:5000/api/books/${bookId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.message || "Book not found.");
          setBook(null);
        } else {
          const data = await res.json();
          setBook(data);
        }
      } catch (err) {
        console.error("Failed to load book", err);
        setError("Unable to load book details.");
        setBook(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBook();
  }, [bookId]);

  if (loading) {
    return (
      <PageLayout>
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <p style={{ fontFamily: "'Cinzel', serif", color: "#6b4c22", fontSize: "18px" }}>
            Loading book details...
          </p>
        </div>
      </PageLayout>
    );
  }

  if (error || !book) {
    return (
      <PageLayout>
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <p style={{ fontFamily: "'Cinzel', serif", color: "#6b4c22", fontSize: "18px" }}>
            {error || "Book not found."}
          </p>
          <button className="bd-back-btn" style={{ margin: "20px auto" }} onClick={() => navigate("/dashboard") }>
            ← Back to Dashboard
          </button>
        </div>
      </PageLayout>
    );
  }

  // // Live computed values from context

  //   return (
  //     <PageLayout>
  //       <div style={{ padding: "60px 0", textAlign: "center" }}>
  //         <p style={{ fontFamily: "'Cinzel', serif", color: "#6b4c22", fontSize: "18px" }}>
  //           Book not found.
  //         </p>
  //         <button className="bd-back-btn" style={{ margin: "20px auto" }} onClick={() => navigate("/dashboard")}>
  //           ← Back to Dashboard
  //         </button>
  //       </div>
  //     </PageLayout>
  //   );
  // }

  const displayBook = {
    ...book,
    cover: book.cover || book.cover_image?.medium || book.cover_image?.small || book.cover_image?.large || "https://via.placeholder.com/160x240?text=No+Cover",
  };

  const avgRating = displayBook.rating ?? 0;
  const totalReviews = (displayBook.total_comments ?? 0) + bookData.reviews.length;
  const relatedBooks = [];

  const handleSubmitReview = () => {
    if (!reviewText.trim()) return;
    addReview(bookId, {
      id: Date.now(),
      user: "You",
      text: reviewText.trim(),
      rating: bookData.userRating,
      date: new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    });
    setReviewText("");
  };

  const STATUS_OPTIONS = [
    { key: "read",    label: "✓ Read" },
    { key: "reading", label: "📖 Currently Reading" },
    { key: "want",    label: "🔖 Want to Read" },
  ];

  const DETAIL_CELLS = [
    { label: "Published", value: displayBook.published_year },
    { label: "Pages",     value: displayBook.pages },
    { label: "Category",  value: displayBook.categories?.join(", ") || "Unknown" },
    { label: "Comments",  value: displayBook.total_comments ?? 0 },
  ];

  return (
    <PageLayout>
      <div className="bd-page">

        {/* ── Back button ── */}
        <button className="bd-back-btn" onClick={() => navigate("/dashboard")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Dashboard
        </button>

        {/* ── Hero ── */}
        <div className="bd-hero">
          <div className="bd-cover-wrap">
            <img src={displayBook.cover} alt={displayBook.title} />
          </div>
          <div className="bd-meta">
            <h1 className="bd-title">{displayBook.title}</h1>
            <p className="bd-author">by {displayBook.author}</p>
            <span className="bd-genre-badge">{displayBook.categories?.[0] || "Unknown"}</span>

            {/* Live per-book rating row */}
            <div className="bd-rating-row">
              <StarsDisplay rating={avgRating} />
              <span className="bd-rating-num">{avgRating.toFixed(1)}</span>
              <span className="bd-reviews-count">
                ({totalReviews.toLocaleString()} review{totalReviews !== 1 ? "s" : ""})
              </span>
            </div>

            <p className="bd-description">{displayBook.description || "No description available."}</p>
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
            <p className="bd-section-heading" style={{ borderBottom: "none", marginBottom: "12px" }}>
              My Collections
            </p>
            <button
              className="bd-add-to-collection-btn"
              onClick={() => setShowCollectionModal(true)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" style={{ width: 15, height: 15, flexShrink: 0 }}>
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              Add to Collection
            </button>
          </div>

          {/* Reading status — persisted per book */}
          <div>
            <p className="bd-section-heading" style={{ borderBottom: "none", marginBottom: "12px" }}>
              Reading Status
            </p>
            <div className="bd-status-group">
              {STATUS_OPTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`bd-status-btn${bookData.readingStatus === key ? " active" : ""}`}
                  onClick={() =>
                    patchBook(bookId, {
                      readingStatus: bookData.readingStatus === key ? null : key,
                    })
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Star rating — persisted per book */}
          <div>
            <p className="bd-section-heading" style={{ borderBottom: "none", marginBottom: "12px" }}>
              Your Rating
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <StarRatingInput
                value={bookData.userRating}
                onChange={(n) => patchBook(bookId, { userRating: n })}
              />
              {bookData.userRating > 0 && (
                <span style={{ fontFamily: "'EB Garamond', serif", fontSize: "15px", color: "#6b4c22" }}>
                  {bookData.userRating} / 5 stars
                </span>
              )}
            </div>
          </div>

          {/* Write review */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <p className="bd-section-heading" style={{ borderBottom: "none", marginBottom: "0" }}>
              Write a Review
            </p>
            <textarea
              className="bd-review-textarea"
              placeholder="Share your thoughts about this book…"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
            />
            <button className="bd-review-submit-btn" onClick={handleSubmitReview}>
              Submit Review
            </button>
          </div>
        </div>

        {/* ── Reviews list — per-book from context ── */}
        <div>
          <p className="bd-section-heading">
            Reader Reviews
            {bookData.reviews.length > 0 && (
              <span style={{ fontFamily: "'EB Garamond', serif", fontWeight: 400, fontSize: "14px", marginLeft: "8px", color: "#7a5c2e" }}>
                ({bookData.reviews.length} submitted)
              </span>
            )}
          </p>
          {bookData.reviews.length === 0 ? (
            <p className="bd-no-reviews">No reviews yet. Be the first to share your thoughts!</p>
          ) : (
            <div className="bd-reviews-list">
              {bookData.reviews.map((rev) => (
                <div key={rev.id} className="bd-review-card">
                  <div className="bd-review-header">
                    <span className="bd-review-user">{rev.user}</span>
                    {rev.rating > 0 && (
                      <div className="bd-review-mini-stars">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <span key={n} className={`star${n <= rev.rating ? "" : " empty"}`}>★</span>
                        ))}
                      </div>
                    )}
                    <span className="bd-review-date">{rev.date}</span>
                  </div>
                  <p className="bd-review-text">{rev.text}</p>
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
                    <img src={rb.cover} alt={rb.title} />
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
          book={displayBook}
          onClose={() => setShowCollectionModal(false)}
        />
      )}
    </PageLayout>
  );
}
