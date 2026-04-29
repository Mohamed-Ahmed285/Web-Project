import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    rate: { type: Number, required: true, min: 1, max: 5 },
    comments: [{ type: String }],
  },
  { timestamps: true, collection: "reviews" }
);

const Review = mongoose.model("Review", reviewSchema, "reviews");

export default Review;
