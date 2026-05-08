import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  getMyCollections,
  getUserCollectionsForBook,
  addBookToCollection,
} from "../controllers/collectionController.js";

const router = express.Router();

router.get("/", authMiddleware, getMyCollections);

router.get("/:id", authMiddleware, getUserCollectionsForBook);

router.post("/addBook/:id", authMiddleware, addBookToCollection);

export default router;
