import express from "express";
import { getAiSuggestions } from "../controllers/aiController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/suggest", protect, getAiSuggestions);

export default router;
