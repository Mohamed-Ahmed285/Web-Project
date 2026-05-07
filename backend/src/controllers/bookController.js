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

export { getBooks };
