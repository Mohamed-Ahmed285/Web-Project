import { createContext, useContext, useState, useCallback } from "react";
import { TOP_BOOKS } from "../data/books";
import { COLLECTIONS as INITIAL_COLLECTIONS } from "../pages/CollectionView";

const BookStoreContext = createContext(null);

function makeDefault() {
  return { readingStatus: null, userRating: 0, reviews: [] };
}

export function BookStoreProvider({ children }) {
  const [bookStore, setBookStore] = useState(() => {
    const init = {};
    TOP_BOOKS.forEach((b) => { init[b.id] = makeDefault(); });
    return init;
  });

  /** Collections – live mutable copy seeded from static data */
  const [collections, setCollections] = useState(() =>
    INITIAL_COLLECTIONS.map((c) => ({ ...c, books: [...c.books] }))
  );

  /**
   * Add a book to an existing collection.
   * Returns "added" | "duplicate".
   */
  const addBookToCollection = useCallback((collectionId, book) => {
    let result = "duplicate";
    setCollections((prev) =>
      prev.map((c) => {
        if (c.id !== collectionId) return c;
        if (c.books.some((b) => b.id === book.id)) return c;
        result = "added";
        return { ...c, books: [...c.books, book] };
      })
    );
    return result;
  }, []);

  /**
   * Create a brand-new collection, optionally seeded with one book.
   * Returns { status: "created", collection } | { status: "duplicate_name" }
   */
  const createCollection = useCallback((name, seedBook = null) => {
    const trimmed = name.trim();

    // Check for duplicate name against current snapshot before mutating
    // We read collections via the functional updater pattern so we always
    // work against the latest state without needing it as a dep.
    let resultStatus = "duplicate_name";
    let createdCollection = null;

    setCollections((prev) => {
      const nameTaken = prev.some(
        (c) => c.name.toLowerCase() === trimmed.toLowerCase()
      );
      if (nameTaken) return prev;               // no mutation
      createdCollection = {
        id: Date.now(),
        name: trimmed,
        books: seedBook ? [seedBook] : [],
      };
      resultStatus = "created";
      return [...prev, createdCollection];
    });

    if (resultStatus !== "created") return { status: "duplicate_name" };
    return { status: "created", collection: createdCollection };
  }, []);

  /** Get the store entry for a single book */
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
      return { ...prev, [id]: { ...entry, reviews: [review, ...entry.reviews] } };
    });
  }, []);

  const getAvgRating = useCallback(
    (bookId) => {
      const staticBook = TOP_BOOKS.find((b) => b.id === bookId);
      if (!staticBook) return 0;
      const entry = bookStore[bookId] ?? makeDefault();
      const userRatings = entry.reviews.map((r) => r.rating).filter((r) => r > 0);
      if (userRatings.length === 0) return staticBook.rating;
      const baseWeight = staticBook.reviewsCount;
      const userSum = userRatings.reduce((a, b) => a + b, 0);
      const totalVotes = baseWeight + userRatings.length;
      return Math.round(((staticBook.rating * baseWeight + userSum) / totalVotes) * 10) / 10;
    },
    [bookStore]
  );

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
    <BookStoreContext.Provider
      value={{
        getBook, patchBook, addReview, getAvgRating, getTotalReviews,
        collections, addBookToCollection, createCollection,
      }}
    >
      {children}
    </BookStoreContext.Provider>
  );
}

export function useBookStore() {
  const ctx = useContext(BookStoreContext);
  if (!ctx) throw new Error("useBookStore must be used inside <BookStoreProvider>");
  return ctx;
}
