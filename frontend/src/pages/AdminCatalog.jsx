import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "./PageLayout";

// ── Toast System ───────────────────────────────────────────────────────────────
function Toast({ toasts }) {
  return (
    <div style={{
      position: "fixed", bottom: "28px", right: "28px",
      display: "flex", flexDirection: "column", gap: "10px",
      zIndex: 9999, pointerEvents: "none",
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: t.type === "error" ? "rgba(120,30,20,0.92)" : "rgba(40,25,10,0.90)",
          color: "#f5e4b9",
          fontFamily: "'EB Garamond', serif",
          fontSize: "15px",
          padding: "12px 20px",
          borderRadius: "12px",
          boxShadow: "0 4px 20px rgba(20,10,2,0.35)",
          display: "flex", alignItems: "center", gap: "10px",
          animation: "fadeSlideIn 0.25s ease",
          minWidth: "220px", maxWidth: "340px",
        }}>
          <span style={{ fontSize: "18px" }}>{t.type === "error" ? "✕" : "✓"}</span>
          {t.message}
        </div>
      ))}
      <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </div>
  );
}

function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = (message, type = "success") => {
    const id = Date.now();
    setToasts(ts => [...ts, { id, message, type }]);
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 3000);
  };
  return { toasts, toast: add };
}

// ── Add Book Dialog ────────────────────────────────────────────────────────────
function AddBookDialog({ onClose, onAdd, isAdding }) {
  const [form, setForm] = useState({ title: "", author: "", genre: "", year: "", pages: "", rating: "", language: "", description: "" });
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleDone = () => {
    if (!form.title.trim() || !form.author.trim()) {
      setError("Title and Author are required.");
      return;
    }
    if (!form.language.trim() || !form.description.trim()) {
      setError("Language and Description are required.");
      return;
    }
    onAdd({
      title: form.title.trim(),
      author: form.author.trim(),
      language: form.language.trim(),
      description: form.description.trim(),
      categories: form.genre.trim() ? [form.genre.trim()] : ["Unknown"],
      published_year: form.year ? parseInt(form.year) : null,
      pages: form.pages ? parseInt(form.pages) : 100,
      rating: form.rating ? parseFloat(form.rating) : 3,
    });
  };

  return (
    <div style={d.overlay}>
      <div style={d.dialog}>
        <h2 style={d.dialogTitle}>Add New Book</h2>
        <p style={d.dialogSub}>Fill in the book details below.</p>

        {error && <p style={d.error}>{error}</p>}

        <div className="row g-3" style={{ marginBottom: "12px" }}>
          {[
            { label: "Title *",     field: "title",    placeholder: "e.g. The Great Gatsby" },
            { label: "Author *",    field: "author",   placeholder: "e.g. F. Scott Fitzgerald" },
            { label: "Genre",       field: "genre",    placeholder: "e.g. Fiction" },
            { label: "Year",        field: "year",     placeholder: "e.g. 1925" },
            { label: "Pages",       field: "pages",    placeholder: "e.g. 180" },
            { label: "Rating",      field: "rating",   placeholder: "e.g. 4.5" },
            { label: "Language *",  field: "language", placeholder: "e.g. English" },
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

        <div style={{ marginBottom: "9px" }}>
          <label style={d.label}>Description *</label>
          <textarea
            style={{ ...d.input, paddingTop: "10px", resize: "vertical" }}
            value={form.description}
            onChange={set("description")}
            placeholder="Short summary or description of the book"
            disabled={isAdding}
          />
        </div>

        <div style={d.actions}>
          <button style={d.cancelBtn} onClick={onClose} disabled={isAdding}>Cancel</button>
          <button style={d.doneBtn} onClick={handleDone} disabled={isAdding}>
            {isAdding ? "Searching & Saving..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirmation Overlay ────────────────────────────────────────────────
function DeleteConfirmDialog({ book, onConfirm, onCancel }) {
  return (
    <div style={del.overlay}>
      <div style={del.dialog}>
        <h2 style={del.title}>Delete Book</h2>
        <p style={del.sub}>Are you sure you want to remove this book from the library?</p>

        <div style={del.bookCard}>
          <img
            src={book.cover_image?.small || "https://via.placeholder.com/80x115?text=No+Cover"}
            alt={book.title}
            style={del.cover}
          />
          <div style={del.bookInfo}>
            <p style={del.bookTitle}>{book.title}</p>
            <p style={del.bookAuthor}><em>{book.author}</em></p>
            {book.categories?.[0] && (
              <p style={del.bookMeta}>{book.categories[0]}{book.published_year ? ` • ${book.published_year}` : ""}</p>
            )}
          </div>
        </div>

        <div style={del.actions}>
          <button style={del.cancelBtn} onClick={onCancel}>Cancel</button>
          <button style={del.deleteBtn} onClick={onConfirm}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Main AdminCatalog ──────────────────────────────────────────────────────────
export default function AdminCatalog() {
  const navigate = useNavigate();
  const { toasts, toast } = useToast();
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [bookToDelete, setBookToDelete] = useState(null);

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

  const handleDeleteConfirm = async () => {
    if (!bookToDelete) return;
    const id = bookToDelete._id;
    const title = bookToDelete.title;
    setBookToDelete(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/books/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBooks(bs => bs.filter(b => b._id !== id));
        toast(`"${title}" removed from library.`);
      } else {
        const errorData = await res.json();
        toast(`Failed to delete: ${errorData.message}`, "error");
      }
    } catch (err) {
      console.error("Failed to delete book", err);
      toast("Failed to delete the book.", "error");
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
        toast(`"${savedBook.title}" added to library.`);
      } else {
        const errorData = await res.json();
        toast(`Failed to add book: ${errorData.message}`, "error");
      }
    } catch (err) {
      console.error("Failed to add book", err);
      toast("Network error while adding book.", "error");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <PageLayout>
      {/* Back Button */}
      <button style={s.backBtn} onClick={() => navigate("/admin")}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Dashboard
      </button>

      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.pageTitle}>Manage Books</h1>
          <p style={s.pageSub}><em>Add new books to your library or remove existing ones.</em></p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="d-flex flex-column flex-sm-row gap-3 align-items-stretch align-items-sm-center">
        <div style={s.searchWrap} className="flex-grow-1">
          <svg style={s.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            style={s.searchInput}
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
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
              <button style={s.deleteBtn} onClick={() => setBookToDelete(book)}>
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

      {bookToDelete && (
        <DeleteConfirmDialog
          book={bookToDelete}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setBookToDelete(null)}
        />
      )}

      <Toast toasts={toasts} />
    </PageLayout>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = {
  backBtn: {
    background: "transparent",
    border: "none",
    color: "var(--accent, #7a5c2e)",
    fontFamily: "'Cinzel', serif",
    fontSize: "0.82rem",
    letterSpacing: "1.5px",
    cursor: "pointer",
    padding: 0,
    marginBottom: "10px",
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    opacity: 0.8,
    transition: "opacity 0.2s, transform 0.2s",
  },
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

// ── Add Book Dialog styles ─────────────────────────────────────────────────────
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
    padding: "28px 40px 28px",
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

// ── Delete Confirm Dialog styles ───────────────────────────────────────────────
const del = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(20,10,2,0.60)",
    backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1100,
  },
  dialog: {
    background: "rgba(245,228,185,0.98)",
    border: "1.5px solid rgba(101,67,33,0.35)",
    borderRadius: "20px",
    padding: "32px 36px 28px",
    width: "100%", maxWidth: "420px",
    boxShadow: "0 20px 60px rgba(20,10,2,0.40)",
    display: "flex", flexDirection: "column", gap: "8px",
  },
  title: {
    fontFamily: "'Cinzel', serif",
    fontSize: "20px", fontWeight: 700,
    color: "#2c1a07", margin: 0,
  },
  sub: {
    fontFamily: "'EB Garamond', serif",
    fontSize: "14px", color: "#6b4c22",
    margin: "0 0 12px",
  },
  bookCard: {
    display: "flex", alignItems: "center", gap: "16px",
    background: "rgba(255,248,220,0.55)",
    border: "1.5px solid rgba(101,67,33,0.2)",
    borderRadius: "12px",
    padding: "14px 18px",
    marginBottom: "20px",
  },
  cover: {
    width: "52px", height: "72px",
    objectFit: "cover", borderRadius: "5px",
    flexShrink: 0,
    boxShadow: "2px 3px 10px rgba(30,15,0,0.3)",
  },
  bookInfo: {
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
  actions: {
    display: "flex", justifyContent: "flex-end", gap: "12px",
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
  deleteBtn: {
    fontFamily: "'Cinzel', serif",
    fontSize: "12px", fontWeight: 600,
    letterSpacing: "0.08em",
    background: "rgba(120,30,20,0.85)",
    border: "none",
    borderRadius: "10px",
    padding: "10px 28px",
    cursor: "pointer", color: "#f5e4b9",
  },
};