import mongoose from "mongoose";

const customCollectionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    img: {type: String},
    description: {type: String , trim:true},
    books: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
  },
  { timestamps: true, collection: "collections" }
);

const CustomCollection = mongoose.model("Collection", customCollectionSchema, "collections");

export default CustomCollection;