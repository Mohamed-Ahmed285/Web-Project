import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getMyCollections,
  getUserCollectionsForBook,
  addBookToCollection,
  createCollection,
  createCollectionWithBook,
} from "../controllers/collectionController.js";

const router = express.Router();

router.get("/", authMiddleware, getMyCollections);

router.post("/", authMiddleware, createCollection);

router.post("wbook/:bookId", authMiddleware, createCollectionWithBook);

router.get("/:id", authMiddleware, getUserCollectionsForBook);

router.post("/addBook/:id", authMiddleware, addBookToCollection);

export default router;
