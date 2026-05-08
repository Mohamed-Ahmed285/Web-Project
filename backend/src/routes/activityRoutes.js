import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getRecentActivity } from "../controllers/activityController.js";

const router = express.Router();

// GET /api/activities/recent
router.get("/recent", authMiddleware, getRecentActivity);

export default router;