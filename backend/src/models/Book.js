import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
    },
    cover_image: {
      small: { type: String, default: "default-s.jpg" },
      medium: { type: String, default: "default-m.jpg" },
      large: { type: String, default: "default-l.jpg" }
    },
    published_year: {
      type: Number,
      required: [true, "Published year is required"],
    },
    categories: {
      type: [String],
      required: [true, "At least one category is required"],
    },
    pages: {
      type: Number,
      required: [true, "Page count is required"],
      min: [1, "Pages must be at least 1"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating cannot be below 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    total_comments: {
      type: Number,
      required: [true, "Total comments count is required"],
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Book = mongoose.model("Book", bookSchema);

export default Book;