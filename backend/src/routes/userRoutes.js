/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User profile endpoints
 */
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getProfile, updateProfile } from "../controllers/userController.js";

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profile_imgs",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
  },
});

const upload = multer({ storage });

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
