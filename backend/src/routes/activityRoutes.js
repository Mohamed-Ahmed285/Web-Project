/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Activity history endpoints
 */
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getRecentActivity } from "../controllers/activityController.js";

const router = express.Router();

// GET /api/activities/recent
/**
 * @swagger
 * /api/activities/recent:
 *   get:
 *     tags: [Activities]
 *     summary: Get recent activity feed for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activities
 */
router.get("/recent", authMiddleware, getRecentActivity);

export default router;