import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getBooks,
  createBook,
  deleteBook,
  getBookById,
  getPopularBooks,
  getBooksPaginated,
} from "../controllers/bookController.js";

const router = express.Router();






//=============================== admin ==============================
// POST /api/books
router.post("/", authMiddleware, createBook);

//========================get books by search=============================
router.get("/search", authMiddleware, getBooksPaginated);

// DELETE /api/books/:id
router.delete("/:id", authMiddleware, deleteBook);





//======================================get top(n) books================================
router.get("/popular", authMiddleware, getPopularBooks);

//========================get one book by id=============================
router.get("/:id", authMiddleware, getBookById);

// ========================get all books==========================
router.get("/", authMiddleware, getBooks);




export default router;
