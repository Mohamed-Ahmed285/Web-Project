import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: [true, "First name is required"],
      minLength: [2, "First name must be at least 2 characters"],
      maxLength: [50, "First name cannot exceed 50 characters"],
      trim: true,
    },
    second_name: {
      type: String,
      required: [true, "Second name is required"],
      minLength: [2, "Second name must be at least 2 characters"],
      maxLength: [50, "Second name cannot exceed 50 characters"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minLength: [6, "Password must be at least 6 characters long"],
    },
    profile_image: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["male", "female", "other"],
        message: "{VALUE} is not a valid gender",
      },
    },
    is_admin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
