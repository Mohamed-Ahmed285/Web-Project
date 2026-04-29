import User from "../models/User.js";
import bcrypt from "bcrypt";

const login = (req, res) => {};

const register = async (req, res) => {
  const { firstName, secondName, email, password, gender } = req.body;
  if (!password || password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }
  try {
    const hashedPassword = await bcrypt.hashSync(password, 10);
    const user = await User.create({
      first_name: firstName,
      second_name: secondName,
      email,
      password: hashedPassword,
      gender,
    });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.name === "ValidationError") {
      const err = Object.values(error.errors)[0].message;
      return res.status(400).json({ message: err });
    }

    if (error.code === 11000) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

export { login, register };
