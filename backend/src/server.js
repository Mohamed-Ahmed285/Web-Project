import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";

dotenv.config();

connectDB();
const PORT = process.env.PORT || 5000;
const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/collections", collectionRoutes);


app.get("/", (req, res) => {
  res.status(200).send("Book Tracker API is running smoothly!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
