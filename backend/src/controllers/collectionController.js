import CustomCollection from "../models/Collection.js";

const getMyCollections = async (req, res) => {
  try {
    const collections = await CustomCollection.find({
      userId: req.user.id,
    }).populate("books");

    res.status(200).json(collections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({
      message: "Server error while fetching collections",
      error: error.message,
    });
  }
};

export { getMyCollections };
