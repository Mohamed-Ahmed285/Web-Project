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

const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (book) {
      res.json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error" });
    console.log(error);
  }
};

export { getBooks, getBookById };
