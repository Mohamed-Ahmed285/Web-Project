import mongoose from "mongoose";

const userBookSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
    status: {
      type: String,
      enum: ["reading", "completed", "want-to-read"],
      required: true,
    },
    isFavourite: { type: Boolean, default: false },
  },
  { timestamps: true, collection: "user_books" }
);

const UserBook = mongoose.model("UserBook", userBookSchema, "user_books");

export default UserBook;