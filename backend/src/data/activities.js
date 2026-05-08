// backend/src/data/activities.js

// Helper to generate dates relative to right now
const now = new Date();
const hoursAgo = (hours) => new Date(now.getTime() - hours * 60 * 60 * 1000);

const activities = [
  {
    type: "register",
    user: "Sarah Smith",
    createdAt: hoursAgo(1), // 1 hour ago
  },
  {
    type: "add",
    user: "Admin",
    book: "Atomic Habits",
    createdAt: hoursAgo(3), // 3 hours ago
  },
  {
    type: "review",
    user: "Omar Khaled",
    book: "The 48 Laws of Power",
    createdAt: hoursAgo(5), // 5 hours ago
  },
  {
    type: "review",
    user: "Sarah Smith",
    book: "The Alchemist",
    createdAt: hoursAgo(24), // 1 day ago
  },
  {
    type: "register",
    user: "Omar Khaled",
    createdAt: hoursAgo(48), // 2 days ago
  }
];

export default activities;