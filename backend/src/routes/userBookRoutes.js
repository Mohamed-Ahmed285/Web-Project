import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getReadingStatus,
  updateReadingStatus,
  getReviews,
  getRate,
  addReview,
} from "../controllers/userBookController.js";

const router = express.Router();

// get book status
router.get("/status/:book_id", authMiddleware, getReadingStatus);

// change status for a book
router.post("/status", authMiddleware, updateReadingStatus);

// get book reviews
router.get("/reviews/:bookId", authMiddleware, getReviews);

// add review
router.post("/reviews", authMiddleware, addReview);

router.get("/rate/:bookId", authMiddleware, getRate);

export default router;
