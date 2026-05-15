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
/**
 * @swagger
 * /api/books/search:
 *   get:
 *     tags: [Books]
 *     summary: Search and paginate books
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Paginated book list
 */
router.get("/search", authMiddleware, getBooksPaginated);

// DELETE /api/books/:id
router.delete("/:id", authMiddleware, deleteBook);





//======================================get top(n) books================================
/**
 * @swagger
 * /api/books/popular:
 *   get:
 *     tags: [Books]
 *     summary: Get most popular books
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of books to return
 *     responses:
 *       200:
 *         description: Popular books list
 */
router.get("/popular", authMiddleware, getPopularBooks);

//========================get one book by id=============================
/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     tags: [Books]
 *     summary: Get a book by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Book'
 *       404:
 *         description: Book not found
 */
router.get("/:id", authMiddleware, getBookById);

// ========================get all books==========================
/**
 * @swagger
 * /api/books:
 *   get:
 *     tags: [Books]
 *     summary: Get all books
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Book'
 */
router.get("/", authMiddleware, getBooks);




export default router;
