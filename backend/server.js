import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import bcrypt from "bcrypt";
import user from "./models/user.js";

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send("Book Tracker API is running smoothly!");
});

app.post("/add-user", async (req, res) => {
  const hashPassword = await bcrypt.hash("password123", 10);
  try {
    const newUser = new user({
      first_name: "Ammar",
      second_name: "Mohamed",
      email: "ammar@gmail.com",
      password: hashPassword,
      gender: "male",
      is_admin: false,
    });

    const savedUser = await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to add user");
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
