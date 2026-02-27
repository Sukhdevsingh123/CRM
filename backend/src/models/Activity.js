import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  lead: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Lead",
    required: [true, "Activity must be associated with a lead"],
  },
  type: {
    type: String,
    required: [true, "Activity type is required"],
    enum: {
      values: ["CALL", "WHATSAPP", "NOTE", "STATUS_CHANGE", "AI_MESSAGE_GENERATED"],
      message: "Activity type must be one of: CALL, WHATSAPP, NOTE, STATUS_CHANGE, AI_MESSAGE_GENERATED",
    },
  },
  description: {type: String,
     required: [true, "Description is required"],
     trim: true,
  },
  meta: {duration: Number,
     previousStatus: String,
     newStatus: String,
    
    generatedContent: { whatsappMessage: String,
      callScript: String,
      objectionHandling: String,
    },
    
    [mongoose.Schema.Types.Mixed]: mongoose.Schema.Types.Mixed,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Activity must have a creator"],
  },
}, {
  timestamps: true,
});

activitySchema.index({ lead: 1, createdAt: -1 });
activitySchema.index({ lead: 1, type: 1, createdAt: -1 });
activitySchema.index({ createdBy: 1, createdAt: -1 });

activitySchema.index({ lead: 1, createdAt: -1, _id: 1 });

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;
