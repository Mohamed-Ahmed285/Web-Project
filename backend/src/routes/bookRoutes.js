import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getBooks, createBook, deleteBook,getBookById } from "../controllers/bookController.js";

const router = express.Router();

router.get("/", authMiddleware, getBooks);
router.get("/:id", authMiddleware, getBookById);

// POST /api/books
router.post("/", authMiddleware, createBook);

// DELETE /api/books/:id
router.delete("/:id", authMiddleware, deleteBook);
export default router;
