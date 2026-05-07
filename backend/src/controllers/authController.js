import User from "../models/User.js";
import bcrypt from "bcrypt";
import { createToken } from "../utils/tokens.js";

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = createToken(user.id);

    res.status(200).json({
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        secondName: user.second_name,
        email: user.email,
        gender: user.gender,
        is_admin: user.is_admin,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

const register = async (req, res) => {
  const { firstName, secondName, email, password, gender } = req.body;

  if (!password || password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters long" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      first_name: firstName,
      second_name: secondName,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      gender,
    });

    const token = createToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        firstName: user.first_name,
        secondName: user.second_name,
        email: user.email,
        gender: user.gender,
        is_admin: user.is_admin,
      },
    });
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
