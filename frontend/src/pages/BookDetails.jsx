import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

// ── Main component ────────────────────────────────────────────────────────────
export default function BookDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const bookId = Number(id);

  // ── Context (per-book persistent store) ──────────────────────────────────
  const { getBook, patchBook, addReview, getAvgRating, getTotalReviews } = useBookStore();
  const bookData = getBook(bookId);

  // Local draft state (only for the textarea — not persisted until submit)
  const [reviewText, setReviewText] = useState("");

  const book = TOP_BOOKS.find((b) => b.id === bookId);

  if (!book) {
    return (
      <PageLayout>
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <p style={{ fontFamily: "'Cinzel', serif", color: "#6b4c22", fontSize: "18px" }}>
            Book not found.
          </p>
          <button className="bd-back-btn" style={{ margin: "20px auto" }} onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </PageLayout>
    );
  }

  // Live computed values from context
  const avgRating    = getAvgRating(bookId);
  const totalReviews = getTotalReviews(bookId);
  const relatedBooks = book.relatedIds.map((rid) => TOP_BOOKS.find((b) => b.id === rid)).filter(Boolean);

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
    { label: "Published", value: book.publishDate },
    { label: "Pages",     value: book.pages },
    { label: "Language",  value: book.language },
    { label: "ISBN",      value: book.isbn },
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
            <img src={book.cover} alt={book.title} />
          </div>
          <div className="bd-meta">
            <h1 className="bd-title">{book.title}</h1>
            <p className="bd-author">by {book.author}</p>
            <span className="bd-genre-badge">{book.genre}</span>

            {/* Live per-book rating row */}
            <div className="bd-rating-row">
              <StarsDisplay rating={avgRating} />
              <span className="bd-rating-num">{avgRating.toFixed(1)}</span>
              <span className="bd-reviews-count">
                ({totalReviews.toLocaleString()} review{totalReviews !== 1 ? "s" : ""})
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
    </PageLayout>
  );
}
