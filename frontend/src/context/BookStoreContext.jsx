import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { TOP_BOOKS } from "../data/books";

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

  const [collections, setCollections] = useState([]);
  const [isCollectionsLoading, setIsCollectionsLoading] = useState(true);

  useEffect(() => {
    const fetchAllCollections = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch("http://localhost:5000/api/collections", {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setCollections(data);
        }
      } catch (error) {
        console.error("Failed to fetch collections centrally", error);
      } finally {
        setIsCollectionsLoading(false);
      }
    };

    fetchAllCollections();
  }, []);

  const getBook = useCallback(
    (id) => bookStore[id] ?? makeDefault(),
    [bookStore]
  );

  const patchBook = useCallback((id, patch) => {
    setBookStore((prev) => ({
      ...prev,
      [id]: { ...(prev[id] ?? makeDefault()), ...patch },
    }));
  }, []);

  const addReview = useCallback((id, review) => {
    setBookStore((prev) => {
      const entry = prev[id] ?? makeDefault();
      return { ...prev, [id]: { ...entry, reviews: [review, ...entry.reviews] } };
    });
  }, []);

  // Fetch User's Status, Rating, and Reviews ──
  const fetchUserBookData = useCallback(async (bookId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const headers = { Authorization: `Bearer ${token}` };

      const [statusRes, rateRes, reviewsRes] = await Promise.all([
        fetch(`http://localhost:5000/api/user-books/status/${bookId}`, { headers }),
        fetch(`http://localhost:5000/api/user-books/rate/${bookId}`, { headers }),
        fetch(`http://localhost:5000/api/user-books/reviews/${bookId}`, { headers })
      ]);

      let readingStatus = null;
      let userRating = 0;
      let reviews = [];

      if (statusRes.ok) readingStatus = await statusRes.json();
      if (rateRes.ok) userRating = await rateRes.json();
      if (reviewsRes.ok) reviews = await reviewsRes.json();

      patchBook(bookId, { readingStatus, userRating, reviews });
    } catch (error) {
      console.error("Error fetching user book data:", error);
    }
  }, [patchBook]);

  // Update Reading Status ──
  const updateReadingStatus = useCallback(async (bookId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/user-books/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bookId, status }),
      });

      if (!response.ok) throw new Error("Failed to update status in DB");

      patchBook(bookId, { readingStatus: status });
      return { success: true, status };
    } catch (error) {
      console.error("Error updating status:", error);
      return { success: false, error };
    }
  }, [patchBook]);

  //  Submit Review ──
  const submitReview = useCallback(async (bookId, rate, comment) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/user-books/review/${bookId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rate, comment }),
      });

      if (!response.ok) throw new Error("Failed to submit review");

      const { review, FirstReview } = await response.json();

      if (comment.trim()) {
        const formattedNewComment = {
          comment: comment.trim(),
          rate: rate || null,
          first_name: localStorage.getItem("first_name") || "You",
          second_name: localStorage.getItem("second_name") || "",
          createdAt: review.createdAt || new Date().toISOString(),
          isTheUser: true,
        };
        addReview(bookId, formattedNewComment);
      }
      return { success: true, FirstReview };

    } catch (error) {
      console.error("Error submitting review:", error);
      return { success: false, error };
    }
  }, [addReview]);

  const addBookToCollection = useCallback(async (collectionId, bookObj) => {
    try {
      const token = localStorage.getItem("token");

      const bookId = bookObj._id;

      const response = await fetch(`http://localhost:5000/api/collections/addBook/${collectionId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookId })
      });

      const data = await response.json();
      if (response.status === 400 && data.message === "Book already in collection") return "duplicate";
      if (!response.ok) throw new Error(data.message || "Failed to add book");

      setCollections((prev) => prev.map((c) =>
        c._id === collectionId ? { ...c, books: [...(c.books || []), bookObj] } : c
      ));
      return "added";
    } catch (error) {
      console.error("Error adding book:", error);
      return "error";
    }
  }, []);
  const createCollection = useCallback(async (name, seedBookId = null) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authorization token found");

      const response = await fetch("http://localhost:5000/api/collections/" + seedBookId, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: name.trim(), bookId: seedBookId }),
      });

      const data = await response.json();

      if (response.status === 409){
        return { status: "duplicate", message: data.message || "Collection name already exists" };
      }

      if (!response.ok) {
        throw new Error(data.message || "Failed to create collection");
      }

      setCollections((prev) => [...prev, data]);

      return { status: "created", collection: data };
    } catch (error) {
      console.error("Error creating collection:", error);
      return { status: "error", message: error.message };
    }
  }, []);

  const getAvgRating = useCallback((bookId) => {
    const staticBook = TOP_BOOKS.find((b) => b.id === bookId);
    if (!staticBook) return 0;
    const entry = bookStore[bookId] ?? makeDefault();
    const userRatings = entry.reviews.map((r) => r.rating).filter((r) => r > 0);
    if (userRatings.length === 0) return staticBook.rating;
    const baseWeight = staticBook.reviewsCount;
    const userSum = userRatings.reduce((a, b) => a + b, 0);
    const totalVotes = baseWeight + userRatings.length;
    return Math.round(((staticBook.rating * baseWeight + userSum) / totalVotes) * 10) / 10;
  }, [bookStore]);

  const getTotalReviews = useCallback((bookId) => {
    const staticBook = TOP_BOOKS.find((b) => b.id === bookId);
    if (!staticBook) return 0;
    const entry = bookStore[bookId] ?? makeDefault();
    return staticBook.reviewsCount + entry.reviews.length;
  }, [bookStore]);

  return (
    <BookStoreContext.Provider
      value={{
        getBook, patchBook, addReview, getAvgRating, getTotalReviews,
        collections, isCollectionsLoading, addBookToCollection, createCollection,
        fetchUserBookData, updateReadingStatus, submitReview
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