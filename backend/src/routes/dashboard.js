import express from "express";
import { getDashboardAnalytics } from "../controllers/dashboardController.js";
import { authenticateToken } from "../middleware/auth.js";
import { cacheDashboard } from "../middleware/cache.js";

const router = express.Router();
router.get("/", authenticateToken, cacheDashboard, getDashboardAnalytics);

export default router;
