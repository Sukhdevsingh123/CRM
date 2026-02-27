import express from "express";
import {getLeadTimeline,addActivity,logCall,logWhatsApp,} from "../controllers/activityController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.get("/:id/timeline", getLeadTimeline);

router.post("/:id/activity", addActivity);
router.post("/:id/call", logCall);
router.post("/:id/whatsapp", logWhatsApp);

export default router;
