import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.js";
import leadRoutes from "./routes/leads.js";
import activityRoutes from "./routes/activities.js";
import dashboardRoutes from "./routes/dashboard.js";
import aiRoutes from "./routes/ai.js";

const app = express();
app.use(cors({
    origin: "*",
    credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("CoachAssist API Running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/ai", aiRoutes);

app.use((req, res, next) => {
  res.status(404).json({ success: false,message: "Route not found", });
});
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);
  
  res.status(error.status || 500).json({success: false,message: error.message || "Internal server error",});
});

export default app;