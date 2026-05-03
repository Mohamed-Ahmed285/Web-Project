import jwt from "jsonwebtoken";

const createToken = (user_id) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  return jwt.sign({ user_id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const verifyToken = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

export { createToken, verifyToken };
