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

router.get("/", authMiddleware, getMyCollections);

router.post("/", authMiddleware, createCollection);

router.post("/book/:bookId", authMiddleware, createCollectionWithBook);

router.get("/:id", authMiddleware, getUserCollectionsForBook);

router.post("/addBook/:id", authMiddleware, addBookToCollection);

router.delete("/:id", authMiddleware, DeleteCollection);

router.delete("/removeBook/:id", authMiddleware, DeleteBookFromCollection);

export default router;
