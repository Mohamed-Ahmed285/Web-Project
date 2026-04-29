// models/User.js
import mongoose from "mongoose";

// An empty schema with { strict: false } tells Mongoose:
// "Accept absolutely any data structure I pass to you."
const userSchema = new mongoose.Schema({}, { strict: false });

// The first argument "User" is the model name.
// The third argument "users" forces Mongoose to use your exact existing collection name in the DB.
const User = mongoose.model("User", userSchema, "users");

export default User;
