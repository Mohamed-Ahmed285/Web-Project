import mongoose from "mongoose";
import dotenv from "dotenv";
import Book from "../models/Book.js";

// Load environment variables so we can get your MONGO_URI
dotenv.config();

const rawBooks = [
  ["The Great Gatsby", "F. Scott Fitzgerald", "Classic", "Historical"],
  ["1984", "George Orwell", "Dystopian", "Science Fiction"],
  ["To Kill a Mockingbird", "Harper Lee", "Historical Fiction", "Drama"],
  ["Dune", "Frank Herbert", "Science Fiction", "Adventure"],
  ["The Hobbit", "J.R.R. Tolkien", "Fantasy", "Adventure"],
  ["Pride and Prejudice", "Jane Austen", "Romance", "Classic"],
  ["The Catcher in the Rye", "J.D. Salinger", "Fiction", "Coming-of-age"],
  ["Fahrenheit 451", "Ray Bradbury", "Dystopian", "Science Fiction"],
  ["Moby-Dick", "Herman Melville", "Adventure", "Classic"],
  ["War and Peace", "Leo Tolstoy", "Historical Fiction", "Classic"],
  ["The Odyssey", "Homer", "Epic", "Poetry"],
  ["Jane Eyre", "Charlotte Brontë", "Gothic", "Romance"],
  ["The Lord of the Rings", "J.R.R. Tolkien", "Fantasy", "Adventure"],
  ["Animal Farm", "George Orwell", "Satire", "Fiction"],
  ["Brave New World", "Aldous Huxley", "Dystopian", "Science Fiction"],
  ["The Chronicles of Narnia", "C.S. Lewis", "Fantasy", "Children"],
  ["The Grapes of Wrath", "John Steinbeck", "Historical Fiction", "Classic"],
  ["Catch-22", "Joseph Heller", "Satire", "War"],
  ["Wuthering Heights", "Emily Brontë", "Gothic", "Romance"],
  ["The Diary of a Young Girl", "Anne Frank", "Biography", "Non-fiction"],
  ["Frankenstein", "Mary Shelley", "Horror", "Science Fiction"],
  ["Dracula", "Bram Stoker", "Horror", "Gothic"],
  ["The Picture of Dorian Gray", "Oscar Wilde", "Philosophical", "Classic"],
  ["A Tale of Two Cities", "Charles Dickens", "Historical Fiction", "Classic"],
  ["Great Expectations", "Charles Dickens", "Coming-of-age", "Classic"],
  ["Les Misérables", "Victor Hugo", "Historical Fiction", "Classic"],
  ["Crime and Punishment", "Fyodor Dostoevsky", "Psychological", "Fiction"],
  ["The Brothers Karamazov", "Fyodor Dostoevsky", "Philosophical", "Classic"],
  ["Anna Karenina", "Leo Tolstoy", "Romance", "Tragedy"],
  ["The Bell Jar", "Sylvia Plath", "Semi-autobiographical", "Fiction"],
  ["The Alchemist", "Paulo Coelho", "Fantasy", "Quest"],
  ["One Hundred Years of Solitude", "Gabriel García Márquez", "Magical Realism", "Classic"],
  ["The Kite Runner", "Khaled Hosseini", "Historical Fiction", "Drama"],
  ["Slaughterhouse-Five", "Kurt Vonnegut", "Satire", "Science Fiction"],
  ["The Handmaid's Tale", "Margaret Atwood", "Dystopian", "Feminist"],
  ["The Secret History", "Donna Tartt", "Mystery", "Thriller"],
  ["A Clockwork Orange", "Anthony Burgess", "Dystopian", "Satire"],
  ["The Road", "Cormac McCarthy", "Post-apocalyptic", "Fiction"],
  ["No Country for Old Men", "Cormac McCarthy", "Thriller", "Crime"],
  ["Blood Meridian", "Cormac McCarthy", "Western", "Historical"],
  ["The Martian", "Andy Weir", "Science Fiction", "Thriller"],
  ["Project Hail Mary", "Andy Weir", "Science Fiction", "Mystery"],
  ["Ender's Game", "Orson Scott Card", "Science Fiction", "Action"],
  ["Neuromancer", "William Gibson", "Cyberpunk", "Science Fiction"],
  ["Snow Crash", "Neal Stephenson", "Cyberpunk", "Satire"],
  ["Foundation", "Isaac Asimov", "Science Fiction", "Epic"],
  ["I, Robot", "Isaac Asimov", "Science Fiction", "Short Stories"],
  ["The Hitchhiker's Guide to the Galaxy", "Douglas Adams", "Comedy", "Science Fiction"],
  ["Good Omens", "Neil Gaiman", "Comedy", "Fantasy"],
  ["American Gods", "Neil Gaiman", "Fantasy", "Mythology"]
];

// Helper to generate random numbers for realistic dummy data
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(1);

const dummyBooks = rawBooks.map((data, index) => {
  // Generate a sequential cover ID so they all load distinct (or fallback) placeholder images
  const coverId = 8259431 + index; 
  
  return {
    title: data[0],
    author: data[1],
    cover_image: {
      small: `https://covers.openlibrary.org/b/id/${coverId}-S.jpg`,
      medium: `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`,
      large: `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`
    },
    published_year: randomInt(1800, 2023),
    description: `A fascinating read titled ${data[0]}, written by the acclaimed ${data[1]}. This book explores themes of ${data[2]} and is considered a staple in its genre.`,
    categories: [data[2], data[3]],
    pages: randomInt(150, 1200),
    language: "English",
    rating: parseFloat(randomFloat(3.5, 5.0)), // Ratings between 3.5 and 5.0
    total_comments: randomInt(0, 45),
    total_reads: randomInt(0, 500) // Highly varied reads to test your Popular Books widget sorting
  };
});

export default dummyBooks;
