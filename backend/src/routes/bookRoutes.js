import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getBooks, createBook, deleteBook,getBookById , getPopularBooks } from "../controllers/bookController.js";

const router = express.Router();

// ========================get all books==========================
router.get("/", authMiddleware, getBooks);


//======================================get top(n) books================================
router.get("/popular", authMiddleware, getPopularBooks);

//========================get one book by id=============================
router.get("/:id", authMiddleware, getBookById);





//=============================== admin ==============================
// POST /api/books
router.post("/", authMiddleware, createBook);

// DELETE /api/books/:id
router.delete("/:id", authMiddleware, deleteBook);
export default router;
