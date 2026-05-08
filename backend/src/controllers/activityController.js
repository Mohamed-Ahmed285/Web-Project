import Activity from "../models/Activity.js";

const getRecentActivity = async (req, res) => {
  try {
    // Grab the 5 newest activities
    const activities = await Activity.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json(activities);
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { getRecentActivity };