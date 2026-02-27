import express from "express";
import { generateAIFollowUp, getAIGeneratedContent } from "../controllers/aiController.js";
import { authenticateToken } from "../middleware/auth.js";
import { aiRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/:id/ai-followup", aiRateLimiter, generateAIFollowUp);

router.get("/:id/ai-content", getAIGeneratedContent);

export default router;
