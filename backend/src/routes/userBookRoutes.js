/**
 * @swagger
 * tags:
 *   name: UserBooks
 *   description: User reading and review endpoints
 */
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
/**
 * @swagger
 * /api/user-books/status/{book_id}:
 *   get:
 *     tags: [UserBooks]
 *     summary: Get current reading status for a book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: book_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Reading status
 */
router.get("/status/:book_id", authMiddleware, getReadingStatus);

// change status for a book
/**
 * @swagger
 * /api/user-books/status:
 *   post:
 *     tags: [UserBooks]
 *     summary: Update reading status for a book
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               book_id:
 *                 type: string
 *               status:
 *                 type: string
 *             required: ["book_id", "status"]
 *     responses:
 *       200:
 *         description: Status updated
 */
router.post("/status", authMiddleware, updateReadingStatus);

// get book reviews
/**
 * @swagger
 * /api/user-books/reviews/{bookId}:
 *   get:
 *     tags: [UserBooks]
 *     summary: Get reviews for a book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book reviews
 */
router.get("/reviews/:bookId", authMiddleware, getReviews);

// add review
/**
 * @swagger
 * /api/user-books/review/{bookId}:
 *   post:
 *     tags: [UserBooks]
 *     summary: Add a review for a book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *               comment:
 *                 type: string
 *             required: ["rating"]
 *     responses:
 *       201:
 *         description: Review added
 */
router.post("/review/:bookId", authMiddleware, addReview);

/**
 * @swagger
 * /api/user-books/rate/{bookId}:
 *   get:
 *     tags: [UserBooks]
 *     summary: Get the average rating for a book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book rating
 */
router.get("/rate/:bookId", authMiddleware, getRate);

export default router;
