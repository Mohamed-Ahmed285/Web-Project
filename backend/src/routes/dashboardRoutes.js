/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard statistics endpoints
 */
import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getDashboardStats } from "../controllers/dashboardController.js";

const router = express.Router();

// GET /api/dashboard/stats
/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get dashboard statistics for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DashboardStats'
 */
router.get("/stats", authMiddleware, getDashboardStats);

export default router;