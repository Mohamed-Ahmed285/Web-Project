import { useState, useEffect } from "react";
import PageLayout from "./PageLayout";

function AddBookDialog({ onClose, onAdd, isAdding }) {
  const [form, setForm] = useState({ title: "", author: "", genre: "", year: "", pages: "" ,rating: "" });
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleDone = () => {
    if (!form.title.trim() || !form.author.trim()) {
      setError("Title and Author are required.");
      return;
    }
    onAdd({
      title: form.title.trim(),
      author: form.author.trim(),
      categories: form.genre.trim() ? [form.genre.trim()] : ["Unknown"],
      published_year: form.year ? parseInt(form.year) : null,
      pages: form.pages ? parseInt(form.pages) : 100,
      rating: form.rating ? parseFloat(form.rating) : 3,
    });
    onClose();
  };

  return (
    <div style={d.overlay}>
      <div style={d.dialog}>
        <h2 style={d.dialogTitle}>Add New Book</h2>
        <p style={d.dialogSub}>Fill in the book details below.</p>

        {error && <p style={d.error}>{error}</p>}

        {/* Bootstrap grid for dialog fields on md+ */}
        <div className="row g-3" style={{ marginBottom: "24px" }}>
          {[
            { label: "Title *",  field: "title",  placeholder: "e.g. The Great Gatsby" },
            { label: "Author *", field: "author", placeholder: "e.g. F. Scott Fitzgerald" },
            { label: "Genre",    field: "genre",  placeholder: "e.g. Fiction" },
            { label: "Year",     field: "year",   placeholder: "e.g. 1925" },
            { label: "Pages",    field: "pages",  placeholder: "e.g. 180" },
            { label: "Rating",   field: "rating", placeholder: "e.g. 4.5" },
          ].map(({ label, field, placeholder }) => (
            <div key={field} className="col-12 col-sm-6">
              <label style={d.label}>{label}</label>
              <input
                style={d.input}
                value={form[field]}
                onChange={set(field)}
                placeholder={placeholder}
                type={field === "year" || field === "pages" || field === "rating" ? "number" : "text"}
                disabled={isAdding}
              />
            </div>
          ))}
        </div>

        <div style={d.actions}>
          <button style={d.cancelBtn} onClick={onClose} disabled={isAdding}>Cancel</button>
          <button style={d.doneBtn} onClick={handleDone} disabled={isAdding}>
            {isAdding ? "Searching & Saving..." : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main AdminCatalog ──────────────────────────────────────────────────────────
export default function AdminCatalog() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/books/search?search=${query}&page=${page}&limit=10`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.books) {
          setBooks(data.books);
          setTotalPages(data.totalPages);
        } else if (Array.isArray(data)) {
          setBooks(data);
          setTotalPages(1);
        } else {
          setBooks([]);
        }
      } catch (err) {
        console.error("Failed to fetch books", err);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(() => fetchBooks(), 300);
    return () => clearTimeout(timeoutId);
  }, [page, query]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/books/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBooks(bs => bs.filter(b => b._id !== id));
      } else {
        const errorData = await res.json();
        alert(`Failed to delete book: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Failed to delete book", err);
      alert("Failed to delete the book.");
    }
  };

  const handleAdd = async (newBookData) => {
    setIsAdding(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBookData),
      });
      if (res.ok) {
        const savedBook = await res.json();
        setBooks(bs => [savedBook, ...bs]);
        setShowDialog(false);
      } else {
        const errorData = await res.json();
        alert(`Failed to add book: ${errorData.message}`);
      }
    } catch (err) {
      console.error("Failed to add book", err);
      alert("Network error while adding book.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <PageLayout>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Manage Books</h1>
          <p style={s.pageSub}><em>Add new books to your library or remove existing ones.</em></p>
        </div>
      </div>

      {/* Toolbar — Bootstrap d-flex for responsive row */}
      <div className="d-flex flex-column flex-sm-row gap-3 align-items-stretch align-items-sm-center">
        <div style={s.searchWrap} className="flex-grow-1">
          <svg style={s.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            style={s.searchInput}
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search your book..."
            spellCheck={false}
          />
          {query && (
            <button style={s.clearBtn} onClick={() => setQuery("")}>✕</button>
          )}
        </div>
        <button style={s.addBtn} onClick={() => setShowDialog(true)}>
          <span style={s.addPlus}>+</span>
          <span style={s.addLabel}>ADD BOOK</span>
        </button>
      </div>

      {/* Book list */}
      <div style={s.listBox}>
        {loading ? (
          <p style={s.empty}>Loading books from database...</p>
        ) : books.length === 0 ? (
          <p style={s.empty}>No books found.</p>
        ) : (
          books.map(book => (
            <div key={book._id} className="d-flex align-items-center gap-3" style={s.bookRow}>
              <img
                src={book.cover_image?.small || "https://via.placeholder.com/80x115?text=No+Cover"}
                alt={book.title}
                style={s.cover}
              />
              <div style={s.info}>
                <p style={s.bookTitle}>{book.title}</p>
                <p style={s.bookAuthor}><em>{book.author}</em></p>
                <p style={s.bookMeta}>
                  {book.categories?.[0] || "Unknown"}
                  {book.published_year ? ` • ${book.published_year}` : ""}
                </p>
              </div>
              <button style={s.deleteBtn} onClick={() => handleDelete(book._id)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
                <span style={s.deleteLabel}>DELETE</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            style={{ padding: "8px 16px", cursor: page === 1 ? "not-allowed" : "pointer", borderRadius: "8px", border: "1px solid #7a5c2e", background: "transparent", color: "#7a5c2e" }}
          >
            Previous
          </button>
          <span style={{ fontFamily: "'EB Garamond', serif", color: "#5a3e1b", fontSize: "15px" }}>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
            style={{ padding: "8px 16px", cursor: page === totalPages ? "not-allowed" : "pointer", borderRadius: "8px", border: "1px solid #7a5c2e", background: "transparent", color: "#7a5c2e" }}
          >
            Next
          </button>
        </div>
      )}

      {showDialog && (
        <AddBookDialog onClose={() => setShowDialog(false)} onAdd={handleAdd} isAdding={isAdding} />
      )}
    </PageLayout>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  pageTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: "clamp(22px, 3vw, 34px)",
    fontWeight: 700,
    color: "#2c1a07",
    letterSpacing: "0.01em",
    lineHeight: 1.2,
  },
  pageSub: {
    fontSize: "14px",
    color: "#6b4c22",
    marginTop: "5px",
    letterSpacing: "0.02em",
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "rgba(255,248,230,0.55)",
    border: "1.5px solid rgba(101,67,33,0.4)",
    borderRadius: "40px",
    padding: "10px 20px",
    boxShadow: "0 2px 10px rgba(80,50,20,0.10)",
    backdropFilter: "blur(4px)",
  },
  searchIcon: {
    width: "17px", height: "17px",
    color: "#7a5c2e", flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none", outline: "none",
    fontFamily: "'EB Garamond', Georgia, serif",
    fontSize: "15px", color: "#3b2a14",
    letterSpacing: "0.02em",
    minWidth: 0,
  },
  clearBtn: {
    background: "none", border: "none",
    cursor: "pointer", color: "#7a5c2e",
    fontSize: "13px", padding: 0, lineHeight: 1,
  },
  addBtn: {
    display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    gap: "2px",
    background: "rgba(255,248,230,0.6)",
    border: "1.5px solid rgba(101,67,33,0.4)",
    borderRadius: "12px",
    padding: "3px 20px",
    cursor: "pointer",
    boxShadow: "0 2px 10px rgba(80,50,20,0.10)",
    backdropFilter: "blur(4px)",
    minWidth: "90px",
    transition: "background 0.2s",
    flexShrink: 0,
  },
  addPlus: {
    fontSize: "22px", color: "#2c1a07",
    lineHeight: 1, fontWeight: 300,
  },
  addLabel: {
    fontFamily: "'Cinzel', serif",
    fontSize: "10px", fontWeight: 600,
    color: "#4a2e0a", letterSpacing: "0.1em",
  },
  listBox: {
    flex: 1,
    overflowY: "scroll",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    padding: "3px",
    maxHeight: "calc(100vh - 280px)",
  },
  empty: {
    fontFamily: "'EB Garamond', serif",
    color: "#7a5c2e", fontSize: "15px",
    textAlign: "center", marginTop: "40px",
  },
  bookRow: {
    background: "rgba(255,248,220,0.45)",
    border: "1.5px solid rgba(101,67,33,0.2)",
    borderRadius: "12px",
    padding: "14px 20px",
    backdropFilter: "blur(3px)",
    boxShadow: "0 2px 10px rgba(50,25,5,0.08)",
  },
  cover: {
    width: "52px", height: "72px",
    objectFit: "cover", borderRadius: "5px",
    flexShrink: 0,
    boxShadow: "2px 3px 10px rgba(30,15,0,0.3)",
  },
  info: {
    flex: 1,
    display: "flex", flexDirection: "column", gap: "3px",
    minWidth: 0,
  },
  bookTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: "15px", fontWeight: 600,
    color: "#2c1a07", margin: 0,
    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
  },
  bookAuthor: {
    fontFamily: "'EB Garamond', serif",
    fontSize: "14px", color: "#5a3e1b", margin: 0,
  },
  bookMeta: {
    fontFamily: "'EB Garamond', serif",
    fontSize: "13px", color: "#9a7a4a", margin: 0,
  },
  deleteBtn: {
    display: "flex", alignItems: "center", gap: "6px",
    background: "none", border: "none",
    cursor: "pointer", color: "#7a5c2e",
    fontFamily: "'Cinzel', serif",
    fontSize: "11px", letterSpacing: "0.08em",
    padding: "6px 10px",
    borderRadius: "8px",
    transition: "background 0.2s, color 0.2s",
    flexShrink: 0,
  },
  deleteLabel: {
    fontFamily: "'Cinzel', serif",
    fontSize: "11px", letterSpacing: "0.1em",
    color: "#7a5c2e",
  },
};

// ── Dialog styles ──────────────────────────────────────────────────────────────
const d = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(20,10,2,0.55)",
    backdropFilter: "blur(3px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000,
  },
  dialog: {
    background: "rgba(245,228,185,0.98)",
    border: "1.5px solid rgba(101,67,33,0.35)",
    borderRadius: "20px",
    padding: "36px 40px 28px",
    width: "100%", maxWidth: "520px",
    boxShadow: "0 20px 60px rgba(20,10,2,0.35)",
    display: "flex", flexDirection: "column", gap: "6px",
  },
  dialogTitle: {
    fontFamily: "'Cinzel', serif",
    fontSize: "22px", fontWeight: 700,
    color: "#2c1a07", margin: 0,
  },
  dialogSub: {
    fontFamily: "'EB Garamond', serif",
    fontSize: "14px", color: "#6b4c22",
    marginBottom: "12px",
  },
  error: {
    fontFamily: "'EB Garamond', serif",
    fontSize: "13px", color: "#8b0000",
    marginBottom: "4px",
  },
  label: {
    fontFamily: "'Cinzel', serif",
    fontSize: "11px", fontWeight: 600,
    color: "#4a2e0a", letterSpacing: "0.08em",
    display: "block", marginBottom: "5px",
  },
  input: {
    background: "rgba(255,248,230,0.7)",
    border: "1.5px solid rgba(101,67,33,0.35)",
    borderRadius: "10px",
    padding: "9px 14px",
    fontFamily: "'EB Garamond', serif",
    fontSize: "15px", color: "#2c1a07",
    outline: "none",
    width: "100%", boxSizing: "border-box",
  },
  actions: {
    display: "flex", justifyContent: "flex-end", gap: "12px",
    marginTop: "8px",
  },
  cancelBtn: {
    fontFamily: "'Cinzel', serif",
    fontSize: "12px", fontWeight: 600,
    letterSpacing: "0.08em",
    background: "transparent",
    border: "1.5px solid rgba(101,67,33,0.4)",
    borderRadius: "10px",
    padding: "10px 24px",
    cursor: "pointer", color: "#6b4c22",
  },
  doneBtn: {
    fontFamily: "'Cinzel', serif",
    fontSize: "12px", fontWeight: 600,
    letterSpacing: "0.08em",
    background: "rgba(60,35,10,0.85)",
    border: "none",
    borderRadius: "10px",
    padding: "10px 28px",
    cursor: "pointer", color: "#f5e4b9",
  },
};
