import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getBooks, getBookById } from "../controllers/bookController.js";

const router = express.Router();

router.get("/", authMiddleware, getBooks);

router.get("/:id", authMiddleware, getBookById);

export default router;
