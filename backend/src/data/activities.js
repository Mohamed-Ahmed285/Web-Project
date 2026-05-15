// backend/src/data/activities.js

// Helper function to generate a random date between two points in the past
const getRandomDate = (startDaysAgo, endDaysAgo) => {
  const now = new Date();
  const start = new Date(now.getTime() - startDaysAgo * 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() - endDaysAgo * 24 * 60 * 60 * 1000);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const users = ["Sarah Smith", "Omar Khaled", "Admin", "John Doe", "Emma Watson"];
const books = ["The Great Gatsby", "1984", "Dune", "The Hobbit", "Atomic Habits", "The Alchemist"];
const otherTypes = ["register", "add", "review"];

const activities = [];

// Generate 150 random activities
for (let i = 0; i < 150; i++) {
  // We want the chart to look active, so let's force 70% of the events to be "read"
  const isRead = Math.random() < 0.7; 
  const type = isRead ? "read" : otherTypes[Math.floor(Math.random() * otherTypes.length)];
  
  const user = users[Math.floor(Math.random() * users.length)];
  const book = (type === "read" || type === "add" || type === "review") 
    ? books[Math.floor(Math.random() * books.length)] 
    : null;

  activities.push({
    type,
    user,
    book,
    // Spread the dates randomly over the last 180 days (~6 months)
    createdAt: getRandomDate(180, 0)
  });
}

// Optional: Hardcode a few recent ones so your "Recent Activity" list on the UI looks good too
activities.push(
  { type: "register", user: "New Guy", createdAt: getRandomDate(1, 0) },
  { type: "read", user: "Sarah Smith", book: "Dune", createdAt: getRandomDate(2, 0) },
  { type: "review", user: "Omar Khaled", book: "1984", createdAt: getRandomDate(3, 0) }
);

export default activities;