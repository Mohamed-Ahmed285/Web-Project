import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getBooks } from "../controllers/bookController.js";

const router = express.Router();

router.get("/", authMiddleware, getBooks);

export default router;
