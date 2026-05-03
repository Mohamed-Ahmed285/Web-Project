import { useState } from "react";

export default function SearchCatalog({ placeholder = "Search about your book...", onSearch }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    setQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSearch) onSearch(query);
  };

  return (
    <div style={styles.wrapper}>
      <svg style={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        style={styles.input}
        spellCheck={false}
      />
    </div>
  );
}

const styles = {
  wrapper: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,255,255,0.18)",
    border: "1.5px solid rgba(101,67,33,0.35)",
    borderRadius: "40px",
    padding: "10px 22px",
    width: "100%",
    maxWidth: "840px",
    boxShadow: "0 2px 12px rgba(80,50,20,0.10)",
    backdropFilter: "blur(2px)",
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
};
