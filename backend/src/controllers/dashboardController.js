import Book from "../models/Book.js";
import User from "../models/User.js";
import Activity from "../models/Activity.js";

const getDashboardStats = async (req, res) => {
  try {
    const [totalBooks, totalUsers, ratingAggregation, rawMonthlyData] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments(),

      Book.aggregate([
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
      ]),

      Activity.aggregate([
        { $match: { type: "read" } },
        
        {
          $group: {
            _id: { 
              month: { $month: "$createdAt" }, 
              year: { $year: "$createdAt" } 
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": -1, "_id.month": -1 } },
        { $limit: 7 },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ])
    ]);

    const topRatedAvg = ratingAggregation.length > 0 
      ? parseFloat(ratingAggregation[0].avgRating.toFixed(1)) 
      : 0;

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    const monthlyActivity = rawMonthlyData.map(item => ({
      month: monthNames[item._id.month - 1],
      count: item.count
    }));

    res.json({
      stats: {
        totalBooks,
        totalUsers,
        topRatedAvg
      },
      monthlyActivity
    });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { getDashboardStats };