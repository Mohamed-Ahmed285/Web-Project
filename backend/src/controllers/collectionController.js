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

const getUserCollectionsForBook = async (req, res) => {
  const user_id = req.user.id;
  const book_id = req.params.id;
  try {
    const collections = await CustomCollection.find({
      userId: user_id,
    });

    const formattedCollections = collections.map((col) => {
      const bookIdStrings = col.books.map((id) => id.toString());

      return {
        id: col._id,
        name: col.name,
        img: col.img,
        alreadyIn: book_id ? bookIdStrings.includes(book_id) : false,
      };
    });
    res.status(200).json(formattedCollections);
  } catch (error) {
    console.error("Error fetching collections:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const addBookToCollection = async (req, res) => {
  const user_id = req.user.id;
  const collection_id = req.params.id;
  const book_id = req.body.bookId;

  if (!collection_id || !book_id) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const collection = await CustomCollection.findById(collection_id);

    if (!collection) {
      return res.status(404).json({ message: "Collection not found" });
    }

    if (collection.userId.toString() !== user_id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (collection.books.includes(book_id)) {
      return res.status(400).json({ message: "Book already in collection" });
    }

    collection.books.push(book_id);
    await collection.save();

    res.status(200).json({ message: "Book added to collection" });
  } catch (error) {
    console.log(error);
  }
};

export { getMyCollections, getUserCollectionsForBook, addBookToCollection };
