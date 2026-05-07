import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SearchCatalog({ placeholder = "Search about your book...", onSearch, books = [] }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
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

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);

    if (!val.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    const q = val.toLowerCase();

    const scored = books
      .map((book) => {
        const title = book.title.toLowerCase();
        const author = book.author.toLowerCase();
        let score = 999;

        if (title === q) score = 0;
        else if (title.startsWith(q)) score = 1;
        else if (title.includes(q)) score = 2;
        else if (author.includes(q)) score = 3;
        else {
          let matched = 0;
          for (const ch of q) if (title.includes(ch)) matched++;
          if (matched > q.length * 0.5) score = 4 + (q.length - matched);
        }

        return { book, score };
      })
      .filter((x) => x.score < 999)
      .sort((a, b) => a.score - b.score)
      .map((x) => x.book);

    setResults(scored);
    setOpen(scored.length > 0);
    if (onSearch) onSearch(val, scored);
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
    navigate(`/book/${book.id}`);
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
        {query && (
          <button onClick={handleClear} style={styles.clearBtn}>✕</button>
        )}
      </div>

      {/* Dropdown */}
      {open && (
        <div style={styles.dropdown}>
          <p style={styles.dropdownLabel}>Search Results</p>
          <div style={styles.resultsList}>
            {results.map((book) => (
              <div
                key={book.id}
                style={styles.resultItem}
                onClick={() => handleSelect(book)}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(101,67,33,0.10)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}
              >
                <img src={book.cover_image} alt={book.title} style={styles.resultCover} />
                <div style={styles.resultInfo}>
                  <p style={styles.resultTitle}>{book.title}</p>
                  <p style={styles.resultAuthor}>{book.author}</p>
                </div>
                <svg style={styles.chevron} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    position: "relative",
    width: "100%",
    maxWidth: "75%",
    zIndex: 100,
  },
  wrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,248,230,0.55)",
    border: "1.5px solid rgba(101,67,33,0.4)",
    borderRadius: "40px",
    padding: "10px 22px",
    width: "100%",
    boxShadow: "0 2px 12px rgba(80,50,20,0.12)",
    backdropFilter: "blur(4px)",
    boxSizing: "border-box",
  },
  icon: {
    width: "18px",
    height: "18px",
    color: "#7a5c2e",
    flexShrink: 0,
  },
  input: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    fontFamily: "'EB Garamond', Georgia, serif",
    fontSize: "15px",
    color: "#3b2a14",
    letterSpacing: "0.02em",
  },
  clearBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#7a5c2e",
    fontSize: "14px",
    padding: "0 2px",
    lineHeight: 1,
    flexShrink: 0,
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    background: "rgba(245,230,190,0.97)",
    border: "1.5px solid rgba(101,67,33,0.3)",
    borderRadius: "16px",
    boxShadow: "0 8px 32px rgba(50,25,5,0.22)",
    backdropFilter: "blur(6px)",
    overflow: "hidden",
    zIndex: 200,
  },
  dropdownLabel: {
    fontFamily: "'Cinzel', serif",
    fontSize: "13px",
    fontWeight: 600,
    color: "#4a2e0a",
    letterSpacing: "0.08em",
    padding: "14px 20px 8px",
    borderBottom: "1px solid rgba(101,67,33,0.15)",
    textTransform: "uppercase",
  },
  resultsList: {
    maxHeight: "320px",
    overflowY: "auto",
    padding: "6px 0",
  },
  resultItem: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    padding: "10px 20px",
    cursor: "pointer",
    transition: "background 0.15s",
    borderBottom: "1px solid rgba(101,67,33,0.08)",
    background: "transparent",
  },
  resultCover: {
    width: "42px",
    height: "58px",
    objectFit: "cover",
    borderRadius: "4px",
    flexShrink: 0,
    boxShadow: "2px 3px 8px rgba(30,15,0,0.3)",
  },
  resultInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  resultTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: "14px",
    fontWeight: 600,
    color: "#2c1a07",
    margin: 0,
  },
  resultAuthor: {
    fontSize: "13px",
    color: "#6b4c22",
    fontFamily: "'EB Garamond', serif",
    margin: 0,
  },
  resultMeta: {
    fontSize: "12px",
    color: "#9a7a4a",
    fontFamily: "'EB Garamond', serif",
    margin: 0,
  },
  chevron: {
    width: "16px",
    height: "16px",
    color: "#9a7a4a",
    flexShrink: 0,
  },
};
