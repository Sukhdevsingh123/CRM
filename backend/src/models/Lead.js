import mongoose from "mongoose";

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, "Phone is required"],
    trim: true,
  },
  source: {
    type: String,
    required: [true, "Source is required"],
    enum: {
      values: ["Instagram", "Referral", "Ads", "Website", "Other"],
      message: "Source must be one of: Instagram, Referral, Ads, Website, Other",
    },
  },
  status: {
    type: String,
    required: [true, "Status is required"],
    enum: {
      values: ["NEW", "CONTACTED", "INTERESTED", "CONVERTED", "LOST"],
      message: "Status must be one of: NEW, CONTACTED, INTERESTED, CONVERTED, LOST",
    },
    default: "NEW",
  },
  tags: {
    type: String,
    trim: true,
    default: "",
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Lead must be assigned to a user"],
  },
  nextFollowUpAt: {
    type: Date,
    default: null,
  },
  aiGeneratedContent: {
    whatsappMessage: String,
    callScript: String,
    objectionHandling: String,
    lastGeneratedAt: Date,
  },
}, {
  timestamps: true,
});

leadSchema.index({ assignedTo: 1, status: 1 });
leadSchema.index({ phone: 1 });
leadSchema.index({ source: 1 });
leadSchema.index({ nextFollowUpAt: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ name: "text", phone: "text" }); 
const Lead = mongoose.model("Lead", leadSchema);

export default Lead;
