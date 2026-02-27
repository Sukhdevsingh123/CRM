import express from "express";
import {createLead, getLeads,getLeadById,updateLead, deleteLead,} from "../controllers/leadController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

router.use(authenticateToken);

router.post("/", createLead);
router.get("/", getLeads);
router.get("/:id", getLeadById);
router.patch("/:id", updateLead);
router.delete("/:id", deleteLead);

export default router;
