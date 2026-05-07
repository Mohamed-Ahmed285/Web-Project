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

    // Format the search query for Open Library
    const searchQuery = `${title} ${author}`.replace(/\s+/g, '+');
    
    // Fetch data from Open Library API
    const response = await fetch(`https://openlibrary.org/search.json?q=${searchQuery}&limit=1`);
    const data = await response.json();

    // Default covers in case the API doesn't find the book or the cover image
    let coverUrls = {
      small: "default-s.jpg", 
      medium: "default-m.jpg",
      large: "default-l.jpg"
    };

    // Extract the cover ID and build the specific size links
    if (data.docs && data.docs.length > 0 && data.docs[0].cover_i) {
      const coverId = data.docs[0].cover_i;
      coverUrls = {
        small: `https://covers.openlibrary.org/b/id/${coverId}-S.jpg`,
        medium: `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`,
        large: `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
      };
    }

    // Create the new book object
    const newBook = new Book({
      title,
      author,
      cover_image: coverUrls,
      published_year,
      categories,
      pages,
      rating
    });

    // Save to database
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);

  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ message: "Failed to add book" });
  }
};

export { getBooks, createBook };