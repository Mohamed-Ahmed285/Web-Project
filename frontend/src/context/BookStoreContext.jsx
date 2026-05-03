import { createContext, useContext, useState, useCallback } from "react";
import { TOP_BOOKS } from "../data/books";

/**
 * BookStoreContext
 * ─────────────────
 * Holds ALL per-book user data in a single map keyed by book id.
 * Shape of each entry:
 *   bookStore[id] = {
 *     readingStatus : null | "read" | "reading" | "want",
 *     userRating    : 0–5,
 *     reviews       : [{ id, user, text, rating, date }, …],
 *   }
 *
 * Derived values (avgRating, totalReviewCount) are computed on the fly
 * so the hero section always shows live numbers.
 */

const BookStoreContext = createContext(null);

function makeDefault() {
  return { readingStatus: null, userRating: 0, reviews: [] };
}

export function BookStoreProvider({ children }) {
  const [bookStore, setBookStore] = useState(() => {
    // Pre-populate with empty entries for every book
    const init = {};
    TOP_BOOKS.forEach((b) => { init[b.id] = makeDefault(); });
    return init;
  });

  /** Get the store entry for a single book (always returns an object) */
  const getBook = useCallback(
    (id) => bookStore[id] ?? makeDefault(),
    [bookStore]
  );

  /** Patch one or more fields for a given book id */
  const patchBook = useCallback((id, patch) => {
    setBookStore((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? makeDefault()), ...patch },
    }));
  }, []);

  /** Add a review to a specific book */
  const addReview = useCallback((id, review) => {
    setBookStore((prev) => {
      const entry = prev[id] ?? makeDefault();
      return {
        ...prev,
        [id]: { ...entry, reviews: [review, ...entry.reviews] },
      };
    });
  }, []);

  /**
   * Compute live average rating for a book.
   * Combines the static base rating with all user-submitted ratings.
   */
  const getAvgRating = useCallback(
    (bookId) => {
      const staticBook = TOP_BOOKS.find((b) => b.id === bookId);
      if (!staticBook) return 0;

      const entry = bookStore[bookId] ?? makeDefault();
      const userRatings = entry.reviews
        .map((r) => r.rating)
        .filter((r) => r > 0);

      if (userRatings.length === 0) return staticBook.rating;

      // Weighted blend: static rating counts as N votes, user ratings each count as 1
      const baseWeight = staticBook.reviewsCount;
      const userSum    = userRatings.reduce((a, b) => a + b, 0);
      const totalVotes = baseWeight + userRatings.length;
      return Math.round(((staticBook.rating * baseWeight + userSum) / totalVotes) * 10) / 10;
    },
    [bookStore]
  );

  /** Total review count = static base + user-submitted */
  const getTotalReviews = useCallback(
    (bookId) => {
      const staticBook = TOP_BOOKS.find((b) => b.id === bookId);
      if (!staticBook) return 0;
      const entry = bookStore[bookId] ?? makeDefault();
      return staticBook.reviewsCount + entry.reviews.length;
    },
    [bookStore]
  );

  return (
    <BookStoreContext.Provider value={{ getBook, patchBook, addReview, getAvgRating, getTotalReviews }}>
      {children}
    </BookStoreContext.Provider>
  );
}

export function useBookStore() {
  const ctx = useContext(BookStoreContext);
  if (!ctx) throw new Error("useBookStore must be used inside <BookStoreProvider>");
  return ctx;
}
