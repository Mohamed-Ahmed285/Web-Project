import mongoose from "mongoose";
import dotenv from "dotenv";
// Import Models
import Activity from "./models/Activity.js";
import Book from "./models/Book.js";

// Import Dummy Data
import activities from "./data/activities.js";
import books from "./data/books.js";

dotenv.config();

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
  try {
    // 1. Wipe the database clean first
    // await Book.deleteMany(); 
    
    // 2. Insert activities
    await Activity.insertMany(activities); // <-- Insert new activities

    console.log(" Data Imported Successfully!");
    process.exit();
  } catch (error) {
    console.error(" Error importing data:", error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await Activity.deleteMany(); // <-- Wipe activities on destroy

    console.log(" Data Destroyed!");
    process.exit();
  } catch (error) {
    console.error(" Error destroying data:", error);
    process.exit(1);
  }
};

importData();

