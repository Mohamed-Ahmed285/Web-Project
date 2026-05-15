import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["register", "add", "review", "read"],
      required: true,
    },
    user: {
      type: String, // Store the name string directly, not the ObjectId!
      required: true,
    },
    book: {
      type: String, // Store the book title directly
      default: null,
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model("Activity", activitySchema);

export default Activity;