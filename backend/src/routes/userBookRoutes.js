import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { updateUserBookStatus } from "../controllers/userBookController.js";

const router = express.Router();




// POST /api/user-books/status
router.post("/status", authMiddleware, updateUserBookStatus);

export default router;