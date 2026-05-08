import mongoose from "mongoose";
import dotenv from "dotenv";
import Book from "../models/Book.js";

// Load environment variables so we can get your MONGO_URI
dotenv.config();

const dummyBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover_image: {
      small: "https://covers.openlibrary.org/b/id/8445722-S.jpg",
      medium: "https://covers.openlibrary.org/b/id/8445722-M.jpg",
      large: "https://covers.openlibrary.org/b/id/8445722-L.jpg"
    },
    published_year: 1925,
    description: "A tragic story of Jay Gatsby, a self-made millionaire, and his pursuit of Daisy Buchanan, a wealthy young woman whom he loved in his youth.",
    categories: ["Classic", "Fiction", "Historical"],
    pages: 180,
    rating: 4.5,
    total_comments: 0,
    total_reads:1
  },
  {
    title: "1984",
    author: "George Orwell",
    cover_image: {
      small: "https://covers.openlibrary.org/b/id/153586-S.jpg",
      medium: "https://covers.openlibrary.org/b/id/153586-M.jpg",
      large: "https://covers.openlibrary.org/b/id/153586-L.jpg"
    },
    published_year: 1949,
    description: "A dystopian social science fiction novel and cautionary tale about the dangers of totalitarianism, mass surveillance, and repressive regimentation of persons and behaviors.",
    categories: ["Dystopian", "Science Fiction", "Classic"],
    pages: 328,
    rating: 4.8,
    total_comments: 0,
    total_reads:12
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    cover_image: {
      small: "https://covers.openlibrary.org/b/id/8259431-S.jpg",
      medium: "https://covers.openlibrary.org/b/id/8259431-M.jpg",
      large: "https://covers.openlibrary.org/b/id/8259431-L.jpg"
    },
    published_year: 1960,
    description: "The story of a young girl's coming-of-age in a sleepy Southern town and the crisis of conscience that rocked it, exploring themes of racial injustice and loss of innocence.",
    categories: ["Historical Fiction", "Classic", "Drama"],
    pages: 281,
    rating: 4.9,
    total_comments: 0,
    total_reads:0
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    cover_image: {
      small: "https://covers.openlibrary.org/b/id/13147154-S.jpg",
      medium: "https://covers.openlibrary.org/b/id/13147154-M.jpg",
      large: "https://covers.openlibrary.org/b/id/13147154-L.jpg"
    },
    published_year: 1965,
    description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the 'spice' melange.",
    categories: ["Science Fiction", "Fantasy", "Adventure"],
    pages: 412,
    rating: 4.7,
    total_comments: 0,
    total_reads:5
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    cover_image: {
      small: "https://covers.openlibrary.org/b/id/8406786-S.jpg",
      medium: "https://covers.openlibrary.org/b/id/8406786-M.jpg",
      large: "https://covers.openlibrary.org/b/id/8406786-L.jpg"
    },
    published_year: 1937,
    description: "A fantasy novel following the quest of home-loving Bilbo Baggins to win a share of the treasure guarded by Smaug the dragon.",
    categories: ["Fantasy", "Adventure", "Classic"],
    pages: 310,
    rating: 4.8,
    total_comments: 0,
    total_reads:6
  }
];
