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

/**
 * @swagger
 * /api/collections/book/{bookId}:
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
router.post("/book/:bookId", authMiddleware, createCollectionWithBook);

/**
 * @swagger
 * /api/collections/{id}:
 *   get:
 *     tags: [Collections]
 *     summary: Get user's collections for a specific book
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
 *         description: user's Collections for the book
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

/**
 * @swagger
 * /api/collections/{id}:
 *   delete:
 *     tags: [Collections]
 *     summary: Delete a collection by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Collection ID
 *     responses:
 *       200:
 *         description: Collection deleted successfully
 *       404:
 *         description: Collection not found
 */
router.delete("/:id", authMiddleware, DeleteCollection);

/**
 * @swagger
 * /api/collections/removeBook/{id}:
 *   delete:
 *     tags: [Collections]
 *     summary: Remove a book from a collection
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Collection ID
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
 *         description: Book removed from collection successfully
 *       404:
 *         description: Collection or book not found
 */
router.delete("/removeBook/:id", authMiddleware, DeleteBookFromCollection);

export default router;
