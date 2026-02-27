import Lead from "../models/Lead.js";
import Activity from "../models/Activity.js";

export const createLead = async (req, res) => {
  try {
    const { name, phone, source, status, tags, nextFollowUpAt } = req.body;
    if (!name || !phone || !source) {
      return res.status(400).json({success: false,message: "Name, phone, and source are required",});
    }

    const lead = new Lead({name,phone,source, status: status || "NEW",tags: tags || "", assignedTo: req.user._id, nextFollowUpAt: nextFollowUpAt ? new Date(nextFollowUpAt) : null,});
    await lead.save();

    const activity = new Activity({lead: lead._id, type: "NOTE",description: "Lead created",createdBy: req.user._id,});
    await activity.save();

    res.status(201).json({success: true,message: "Lead created successfully",data: { lead },});
  } 
  catch (error) {
    // console.error("Create lead error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ success: false,message: "Validation failed",errors,});
    }
    res.status(500).json({success: false,message: "Internal server error", });
  }
};

export const getLeads = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      tags,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = { assignedTo: req.user._id };
    if (status) {
      query.status = status;
    }

    if (tags) {
      query.tags = { $regex: tags, $options: "i" };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    const leads = await Lead.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate("assignedTo", "name email")
      .exec();

    const total = await Lead.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {leads,
       pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } 
  catch (error) {
    console.error("Get leads error:", error);
    res.status(500).json({success: false, message: "Internal server error",
    });
  }
};

export const getLeadById = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findOne({
      _id: id,
      assignedTo: req.user._id,
    }).populate("assignedTo", "name email");

    if (!lead) {
      return res.status(404).json({ success: false,message: "Lead not found",});
    }

    res.status(200).json({success: true,data: { lead },});
  } catch (error) {
    console.error("Get lead error:", error);

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

export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, source, status, tags, nextFollowUpAt } = req.body;
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
    const oldStatus = lead.status;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (source !== undefined) updateData.source = source;
    if (status !== undefined) updateData.status = status;
    if (tags !== undefined) updateData.tags = tags;
    if (nextFollowUpAt !== undefined) {
      updateData.nextFollowUpAt = nextFollowUpAt ? new Date(nextFollowUpAt) : null;
    }

    const updatedLead = await Lead.findByIdAndUpdate(id,updateData,
      { new: true, runValidators: true }
    ).populate("assignedTo", "name email");

    if (status !== undefined && status !== oldStatus) {
      const activity = new Activity({
        lead: id,
        type: "STATUS_CHANGE",
        description: `Status changed from ${oldStatus} to ${status}`,
        meta: {
          previousStatus: oldStatus,
          newStatus: status,
        },
        createdBy: req.user._id,
      });
      await activity.save();
    }

    res.status(200).json({success: true, message: "Lead updated successfully",data: { lead: updatedLead },
    });
  } 
  catch (error) {
    console.error("Update lead error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({success: false,message: "Validation failed", errors,});
    }
    if (error.name === "CastError") {
      return res.status(400).json({ success: false,message: "Invalid lead ID",});
    }
    res.status(500).json({ success: false,message: "Internal server error",});
  }
};
export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findOneAndDelete({_id: id,assignedTo: req.user._id, });

    if (!lead) {
      return res.status(404).json({success: false,message: "Lead not found", });
    }
    await Activity.deleteMany({ lead: id });

    res.status(200).json({success: true,message: "Lead deleted successfully",
    });
  } 
   catch (error) {
    console.error("Delete lead error:", error);
    if (error.name === "CastError") {
      return res.status(400).json({success: false,message: "Invalid lead ID",});
    }
    res.status(500).json({success: false,message: "Internal server error",});
  }
};
