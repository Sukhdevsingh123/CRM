import Lead from "../models/Lead.js";
import Activity from "../models/Activity.js";
import geminiService from "../services/geminiService.js";
import { invalidateUserCache } from "../middleware/cache.js";

export const generateAIFollowUp = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findOne({
       _id: id,
      assignedTo: req.user._id,
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const recentActivities = await Activity.find({ lead: id })
      .sort({ createdAt: -1 })
      .limit(3)
      .populate("createdBy", "name")
      .exec();

    let aiResponse;
    try {
      aiResponse = await geminiService.generateFollowUp(
        lead.toObject(),
        recentActivities.map(activity => activity.toObject())
      );
    } catch (err) {
      console.error('Error generating AI text:', err);
      return res.status(500).json({
        success: false,
        message: err.message || "Failed to generate AI content",
      });
    }
    const { whatsappMessage, callScript, objectionHandling } = aiResponse.data;

    lead.aiGeneratedContent = {
      whatsappMessage,
      callScript,
      objectionHandling,
      lastGeneratedAt: new Date(),
    };
    await lead.save();

    const activity = new Activity({
      lead: id,
      type: "AI_MESSAGE_GENERATED",
      description: "AI follow-up content generated",
      meta: {
        generatedContent: {
          whatsappMessage,
          callScript,
          objectionHandling,
        },
      },
      createdBy: req.user._id,
    });
    await activity.save();
    await activity.populate("createdBy", "name email");

    await invalidateUserCache(req.user._id.toString(), [
      'dashboard:{userId}:*',
      'cache:*:{userId}:*'
    ]);

    res.status(200).json({
      success: true,
      message: "AI follow-up generated successfully",
      data: {
        lead,
        aiContent: aiResponse.data,
        activity,
      },
    });

  } catch (error) {
    console.error("AI follow-up generation error:", error);

    if (error.message.includes("limit exceeded")) {
      return res.status(429).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("not configured") || error.message.includes("authentication failed")) {
      return res.status(503).json({
        success: false,
        message: "AI service currently unavailable. Please contact support.",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to generate AI follow-up",
    });
  }
};

export const getAIGeneratedContent = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findOne({
      _id: id,
      assignedTo: req.user._id,
    }).select("aiGeneratedContent");

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        aiContent: lead.aiGeneratedContent,
        lastGeneratedAt: lead.aiGeneratedContent?.lastGeneratedAt,
      },
    });

  } catch (error) {
    console.error("Get AI content error:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid lead ID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
