import { verifyToken } from "../utils/tokens.js";

const authMiddleware = (req, res, next) => {
  const authorization = req.headers.authorization;
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authorization header missing or malformed",
    });
  }

  const token = authorization.split(" ")[1];

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.user_id };
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
