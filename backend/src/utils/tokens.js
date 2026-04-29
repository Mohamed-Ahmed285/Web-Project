import jwt from "jsonwebtoken";

const createToken = (user_id) => {
  return jwt.sign({ user_id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
