import Book from "../models/Book.js";

const getBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books || []);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    console.log(error);
  }
};

const createBook = async (req, res) => {
  try {
    const { title, author, published_year, categories, pages, rating } = req.body;

    // Input validation
    if (!title?.trim() || !author?.trim()) {
      return res.status(400).json({ message: "Title and author are required" });
    }

    if (!published_year || published_year < 1000 || published_year > new Date().getFullYear() + 1) {
      return res.status(400).json({ message: "Valid published year is required" });
    }

    if (!pages || pages < 1 || pages > 10000) {
      return res.status(400).json({ message: "Valid page count (1-10000) is required" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Ensure categories is an array
    const bookCategories = Array.isArray(categories) ? categories : [categories].filter(Boolean);

    if (bookCategories.length === 0) {
      return res.status(400).json({ message: "At least one category is required" });
    }

    // Check for duplicate books
    const existingBook = await Book.findOne({
      title: { $regex: new RegExp(`^${title.trim()}$`, 'i') },
      author: { $regex: new RegExp(`^${author.trim()}$`, 'i') }
    });

    if (existingBook) {
      return res.status(409).json({ message: "A book with this title and author already exists" });
    }

    const searchQuery = `${title.trim()} ${author.trim()}`.replace(/\s+/g, '+');

    let coverUrls = {
      small: "https://via.placeholder.com/80x115?text=No+Cover",
      medium: "https://via.placeholder.com/120x160?text=No+Cover",
      large: "https://via.placeholder.com/200x280?text=No+Cover"
    };

    try {
      const response = await fetch(`https://openlibrary.org/search.json?q=${searchQuery}&limit=1`);
      if (response.ok) {
        const data = await response.json();

        if (data.docs && data.docs.length > 0 && data.docs[0].cover_i) {
          const coverId = data.docs[0].cover_i;
          coverUrls = {
            small: `https://covers.openlibrary.org/b/id/${coverId}-S.jpg`,
            medium: `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`,
            large: `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
          };
        }
      }
    } catch (apiError) {
      console.warn("Failed to fetch cover from Open Library:", apiError.message);
      // Continue with placeholder covers
    }

    // Create the new book object
    const newBook = new Book({
      title: title.trim(),
      author: author.trim(),
      cover_image: coverUrls,
      published_year,
      categories: bookCategories,
      pages,
      rating,
      total_comments: 0
    });

    // Save to database
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);

  } catch (error) {
    console.error("Error adding book:", error);
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: validationErrors.join(", ") });
    }
    res.status(500).json({ message: "Failed to add book" });
  }
};

const getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedBook = await Book.findByIdAndDelete(id);
    
    if (!deletedBook) {
      return res.status(404).json({ message: "Book not found" });
    }
    
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ message: "Server error" });
  }
};
export { getBooks, getBookById, createBook, deleteBook };