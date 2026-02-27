import Activity from "../models/Activity.js";
import Lead from "../models/Lead.js";

export const getLeadTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    const { cursor, limit = 20 } = req.query;

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
    const query = { lead: id };

    if (cursor) {
      query.createdAt = { $lt: new Date(cursor) };
    }

    const activities = await Activity.find(query)
      .sort({ 
        createdAt: -1, _id: -1 
      }) 
      .limit(parseInt(limit) + 1) 
      .populate("createdBy", "name email")
      .exec();

    const hasMore = activities.length > parseInt(limit);
    if (hasMore) {
      activities.pop(); 
    }

    const nextCursor = activities.length > 0 
      ? activities[activities.length - 1].createdAt.toISOString()
      : null;

    res.status(200).json({
      success: true,
      data: {
        activities,
        pagination: {
          nextCursor,
          hasMore,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get timeline error:", error);
    
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

export const addActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, description, meta = {} } = req.body;

    if (!type || !description) {
      return res.status(400).json({
        success: false,
        message: "Activity type and description are required",
      });
    }

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

    const activity = new Activity({
      lead: id,
      type,
      description,
      meta,
      createdBy: req.user._id,
    });

    await activity.save();
    await activity.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Activity added successfully",
      data: { activity },
    });
  } catch (error) {
    console.error("Add activity error:", error);
    
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid leadID",
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logCall = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, duration } = req.body;

    // Validate required fields
    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }

    // Verify lead exists and belongs to user
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

    // Create call activity
    const activity = new Activity({
      lead: id,
      type: "CALL",
      description,
      meta: {
        duration: duration ? parseInt(duration) : null,
      },
      createdBy: req.user._id,
    });

    await activity.save();
    await activity.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "Call logged successfully",
      data: { activity },
    });
  } catch (error) {
    console.error("Log call error:", error);
    
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

export const logWhatsApp = async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    if (!description) {
      return res.status(400).json({
        success: false,
        message: "Description is required",
      });
    }
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
    const activity = new Activity({
      lead: id,
      type: "WHATSAPP",
      description,
      createdBy: req.user._id,
    });

    await activity.save();
    await activity.populate("createdBy", "name email");

    res.status(201).json({
      success: true,
      message: "WhatsApp message logged successfully",
      data: { activity },
    });
  } catch (error) {
    console.error("Log WhatsApp error:", error);
    
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
