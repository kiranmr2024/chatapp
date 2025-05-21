const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    message: {
      text: { type: String, default: "" },
      mediaUrl: { type: String, default: "" },
      mediaType: { type: String, enum: ["", "image", "document"], default: "" },
    },
    users: Array,
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Messages", MessageSchema);
