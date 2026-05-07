import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getBooks, createBook, deleteBook } from "../controllers/bookController.js";

const router = express.Router();

router.get("/", authMiddleware, getBooks);

// POST /api/books
router.post("/", authMiddleware, createBook);

// DELETE /api/books/:id
router.delete("/:id", authMiddleware, deleteBook);
export default router;
