import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchCatalog({ placeholder = "Search about your book...", onSearch }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced Server-side Search
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        setOpen(false);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const response = await fetch(
          `http://localhost:5000/api/books/search?search=${encodeURIComponent(query)}&limit=5`, { headers }
        );

        if (response.ok) {
          const data = await response.json();
          const fetchedBooks = data.books || [];
          setResults(fetchedBooks);
          setOpen(fetchedBooks.length > 0);
          if (onSearch) onSearch(query, fetchedBooks);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, onSearch]);

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    if (onSearch) onSearch("", []);
  };

  const handleSelect = (book) => {
    setQuery("");
    setResults([]);
    setOpen(false);
    if (onSearch) onSearch(book.title, [book]);
    navigate(`/book/${book._id}`);
  };

  return (
    <div ref={wrapperRef} style={styles.container}>
      {/* Input bar */}
      <div style={styles.wrapper}>
        <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => results.length > 0 && setOpen(true)}
          placeholder={placeholder}
          style={styles.input}
          spellCheck={false}
        />
        {loading ? (
          <div style={styles.loader}>...</div> // Optional loading indicator
        ) : query ? (
          <button onClick={handleClear} style={styles.clearBtn}>✕</button>
        ) : null}
      </div>

      {/* Dropdown */}
      {open && (
        <div style={styles.dropdown}>
          <p style={styles.dropdownLabel}>Search Results</p>
          <div style={styles.resultsList}>
            {results.length > 0 ? (
              results.map((book) => (
                <div
                  key={book._id}
                  style={styles.resultItem}
                  onClick={() => handleSelect(book)}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(101,67,33,0.10)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <img src={book.cover_image.medium} alt={book.title} style={styles.resultCover} />

                  <div style={styles.resultInfo}>
                    <p style={styles.resultTitle}>{book.title}</p>
                    <p style={styles.resultAuthor}>{book.author}</p>
                  </div>
                  <svg style={styles.chevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              ))
            ) : (
              <p style={{ padding: "10px 20px", color: "#6b4c22" }}>No books found.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Keep your existing styles down here...
const styles = {
  // ... (keep all your existing styles exactly the same)
  container: { position: "relative", width: "100%", maxWidth: "75%", zIndex: 100 },
  wrapper: { display: "flex", alignItems: "center", gap: "10px", background: "rgba(255,248,230,0.55)", border: "1.5px solid rgba(101,67,33,0.4)", borderRadius: "40px", padding: "10px 22px", width: "100%", boxShadow: "0 2px 12px rgba(80,50,20,0.12)", backdropFilter: "blur(4px)", boxSizing: "border-box" },
  icon: { width: "18px", height: "18px", color: "#7a5c2e", flexShrink: 0 },
  input: { flex: 1, background: "transparent", border: "none", outline: "none", fontFamily: "'EB Garamond', Georgia, serif", fontSize: "15px", color: "#3b2a14", letterSpacing: "0.02em" },
  clearBtn: { background: "none", border: "none", cursor: "pointer", color: "#7a5c2e", fontSize: "14px", padding: "0 2px", lineHeight: 1, flexShrink: 0 },
  dropdown: { position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "rgba(245,230,190,0.97)", border: "1.5px solid rgba(101,67,33,0.3)", borderRadius: "16px", boxShadow: "0 8px 32px rgba(50,25,5,0.22)", backdropFilter: "blur(6px)", overflow: "hidden", zIndex: 200 },
  dropdownLabel: { fontFamily: "'Cinzel', serif", fontSize: "13px", fontWeight: 600, color: "#4a2e0a", letterSpacing: "0.08em", padding: "14px 20px 8px", borderBottom: "1px solid rgba(101,67,33,0.15)", textTransform: "uppercase" },
  resultsList: { maxHeight: "320px", overflowY: "auto", padding: "6px 0" },
  resultItem: { display: "flex", alignItems: "center", gap: "14px", padding: "10px 20px", cursor: "pointer", transition: "background 0.15s", borderBottom: "1px solid rgba(101,67,33,0.08)", background: "transparent" },
  resultCover: { width: "42px", height: "58px", objectFit: "cover", borderRadius: "4px", flexShrink: 0, boxShadow: "2px 3px 8px rgba(30,15,0,0.3)" },
  resultInfo: { flex: 1, display: "flex", flexDirection: "column", gap: "2px" },
  resultTitle: { fontFamily: "'Cinzel', serif", fontSize: "14px", fontWeight: 600, color: "#2c1a07", margin: 0 },
  resultAuthor: { fontSize: "13px", color: "#6b4c22", fontFamily: "'EB Garamond', serif", margin: 0 },
  chevron: { width: "16px", height: "16px", color: "#9a7a4a", flexShrink: 0 },
  loader: { fontSize: "12px", color: "#7a5c2e", paddingRight: "5px" }
};