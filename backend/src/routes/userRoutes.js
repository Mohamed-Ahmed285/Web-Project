import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getProfile, updateProfile } from "../controllers/userController.js";

const router = express.Router();
const uploadDir = path.join(process.cwd(), "assets", "profile_imgs");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${req.user?.id || Date.now()}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

router.get("/me", authMiddleware, getProfile);
router.put("/me", authMiddleware, upload.single("profile_image"), updateProfile);

export default router;
