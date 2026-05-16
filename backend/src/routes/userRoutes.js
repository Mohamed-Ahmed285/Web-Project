/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile endpoints
 */
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getProfile, updateProfile } from "../controllers/userController.js";

const router = express.Router();
// const uploadDir = path.join(process.cwd(), "assets", "profile_imgs");
// fs.mkdirSync(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: uploadDir,
//   filename: (req, file, cb) => {
//     const ext = path.extname(file.originalname);
//     const filename = `${req.user?.id || Date.now()}-${Date.now()}${ext}`;
//     cb(null, filename);
//   },
// });

// const upload = multer({ storage });

/**
 * @swagger
 * /api/user/me:
 *   get:
 *     tags: [Users]
 *     summary: Get authenticated user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authMiddleware, getProfile);

/**
 * @swagger
 * /api/user/me:
 *   put:
 *     tags: [Users]
 *     summary: Update authenticated user profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               secondName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               profile_image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated profile data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProfileResponse'
 */
router.put("/me", authMiddleware, upload.single("profile_image"), updateProfile);

export default router;
