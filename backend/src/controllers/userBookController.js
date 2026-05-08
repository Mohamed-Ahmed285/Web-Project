import UserBook from "../models/UserBook.js";
import Book from "../models/Book.js";

const updateUserBookStatus = async (req, res) => {
  try {
    const { bookId, status, isFavourite } = req.body;
    const userId = req.user.id; 

    let userBook = await UserBook.findOne({ userId, bookId });
    const previousStatus = userBook ? userBook.status : null;

    if (userBook) {
      userBook.status = status || userBook.status;
      if (isFavourite !== undefined) userBook.isFavourite = isFavourite;
      await userBook.save();
    } else {
      userBook = new UserBook({ userId, bookId, status, isFavourite });
      await userBook.save();
    }
    if (status === "completed" && previousStatus !== "completed") {
      await Book.findByIdAndUpdate(bookId, { $inc: { total_reads: 1 } });
    } 
    else if (previousStatus === "completed" && status !== "completed") {
      await Book.findByIdAndUpdate(bookId, { $inc: { total_reads: -1 } });
    }

    res.status(200).json({ message: "Shelf updated", userBook });

  } catch (error) {
    console.error("Error updating user book:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export { updateUserBookStatus };