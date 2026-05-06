import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import Book from "../models/Book.js";

const router = express.Router();

router.get("/", authMiddleware, async (req, res) => {
  const books = await Book.find();
  res.json(books);
});

export default router;
