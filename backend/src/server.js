import express from "express";
import dotenv from "dotenv";
import path from "path";
import connectDB from "./config/db.js";
import cors from "cors";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import userBookRoutes from "./routes/userBookRoutes.js";
import collectionRoutes from "./routes/collectionRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();

connectDB();
const PORT = process.env.PORT || 5000;
const app = express();

app.use(
  cors({
    origin: ["http://localhost:3000", "https://shelf-2.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());
app.use('/assets/profile_imgs', express.static(path.join(process.cwd(), 'assets', 'profile_imgs')));

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Shelf API",
      version: "1.0.0",
      description: "API documentation for Shelf",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Local Development Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            first_name: { type: "string" },
            second_name: { type: "string" },
            email: { type: "string", format: "email" },
            gender: { type: "string", enum: ["male", "female", "other"] },
            is_admin: { type: "boolean" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        LoginRequest: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
          required: ["email", "password"],
        },
        RegisterRequest: {
          type: "object",
          properties: {
            firstName: { type: "string" },
            secondName: { type: "string" },
            email: { type: "string", format: "email" },
            password: { type: "string" },
            gender: { type: "string", enum: ["male", "female", "other"] },
          },
          required: ["firstName", "secondName", "email", "password", "gender"],
        },
        Book: {
          type: "object",
          properties: {
            _id: { type: "string" },
            title: { type: "string" },
            author: { type: "string" },
            cover_image: { type: "object" },
            published_year: { type: "integer" },
            categories: { type: "array", items: { type: "string" } },
            pages: { type: "integer" },
            rating: { type: "number" },
            total_comments: { type: "integer" },
          },
        },
        CreateBookRequest: {
          type: "object",
          properties: {
            title: { type: "string" },
            author: { type: "string" },
            published_year: { type: "integer" },
            categories: { type: "array", items: { type: "string" } },
            pages: { type: "integer" },
            rating: { type: "number" },
          },
          required: ["title", "author", "published_year", "categories", "pages", "rating"],
        },
        ProfileResponse: {
          type: "object",
          properties: {
            id: { type: "string" },
            first_name: { type: "string" },
            second_name: { type: "string" },
            email: { type: "string", format: "email" },
            gender: { type: "string" },
            is_admin: { type: "boolean" },
            profile_image: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        UpdateProfileRequest: {
          type: "object",
          properties: {
            firstName: { type: "string" },
            secondName: { type: "string" },
            email: { type: "string", format: "email" },
          },
          required: ["firstName", "secondName", "email"],
        },
        Activity: {
          type: "object",
          properties: {
            type: { type: "string" },
            user: { type: "string" },
            book: { type: ["string", "null"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        DashboardStats: {
          type: "object",
          properties: {
            totalBooks: { type: "integer" },
            totalReads: { type: "integer" },
            totalReviews: { type: "integer" },
            totalCollections: { type: "integer" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(process.cwd(), "src", "routes", "*.js")], 
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/user-books", userBookRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.status(200).send("Book Tracker API is running smoothly!");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
