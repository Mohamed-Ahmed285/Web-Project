/**
 * @swagger
 * tags:
 *   name: Collections
 *   description: User collection endpoints
 */
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getMyCollections,
  getUserCollectionsForBook,
  addBookToCollection,
  createCollection,
  createCollectionWithBook,
  DeleteCollection,
  DeleteBookFromCollection,
} from "../controllers/collectionController.js";

const router = express.Router();

/**
 * @swagger
 * /api/collections:
 *   get:
 *     tags: [Collections]
 *     summary: Get the authenticated user collections
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User collections
 */
router.get("/", authMiddleware, getMyCollections);

/**
 * @swagger
 * /api/collections:
 *   post:
 *     tags: [Collections]
 *     summary: Create a new book collection
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Collection created
 */
router.post("/", authMiddleware, createCollection);

router.post("/book/:bookId", authMiddleware, createCollectionWithBook);
/**
 * @swagger
 * /api/collections/wbook/{bookId}:
 *   post:
 *     tags: [Collections]
 *     summary: Create a collection and add a book to it
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bookId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Collection created and book added
 */

/**
 * @swagger
 * /api/collections/{id}:
 *   get:
 *     tags: [Collections]
 *     summary: Get collections for a specific book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Collections for the book
 */
router.get("/:id", authMiddleware, getUserCollectionsForBook);

/**
 * @swagger
 * /api/collections/addBook/{id}:
 *   post:
 *     tags: [Collections]
 *     summary: Add a book to an existing collection
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookId:
 *                 type: string
 *             required: ["bookId"]
 *     responses:
 *       200:
 *         description: Book added to collection
 */
router.post("/addBook/:id", authMiddleware, addBookToCollection);

router.delete("/:id", authMiddleware, DeleteCollection);

router.delete("/removeBook/:id", authMiddleware, DeleteBookFromCollection);

export default router;
