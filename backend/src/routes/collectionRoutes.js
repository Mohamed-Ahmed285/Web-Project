import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getMyCollections } from "../controllers/collectionController.js";

const router = express.Router();

router.get("/", authMiddleware, getMyCollections);

export default router;
