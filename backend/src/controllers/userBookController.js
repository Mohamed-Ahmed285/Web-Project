import UserBook from "../models/UserBook.js";
import Review from "../models/Review.js";
import Book from "../models/Book.js";

const getReadingStatus = async (req, res) => {
  const bookId = req.params.book_id;
  const userId = req.user.id;
  try {
    const userBook = await UserBook.findOne({ userId, bookId });
    const status = userBook ? userBook.status : null;
    res.status(200).json(status);
  } catch (err) {
    console.error("Error fetching reading status:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateReadingStatus = async (req, res) => {
  const { bookId, status } = req.body;
  const userId = req.user.id;

  try {
    if (!status) {
      await UserBook.findOneAndDelete({ userId, bookId });

      return res.json({
        message: "Status removed",
        status: null,
      });
    }

    const validStatuses = ["reading", "completed", "want-to-read"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const userBook = await UserBook.findOneAndUpdate(
      { userId, bookId },
      {
        userId,
        bookId,
        status,
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
      },
    );

    res.json({
      message: "Status updated successfully",
      status: userBook.status,
    });
  } catch (error) {
    console.error("Error updating status:", error);

    res.status(500).json({
      message: "Server error updating status",
    });
  }
};

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ bookId: req.params.bookId }).populate(
      "userId",
      "first_name second_name",
    );

    const commentsWithRatings = [];

    reviews.forEach((review) => {
      if (review.comments && review.comments.length > 0) {
        const reversedComments = [...review.comments].reverse();

        reversedComments.forEach((commentObj) => {
          commentsWithRatings.push({
            comment: commentObj.text,
            rate: review.rate || null,
            first_name: review.userId.first_name,
            second_name: review.userId.second_name,
            createdAt: commentObj.createdAt,
            isTheUser: review.userId._id.toString() === req.user.id,
          });
        });
      }
    });

    commentsWithRatings.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    res.status(200).json(commentsWithRatings);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch comments", error: error.message });
  }
};

const addReview = async (req, res) => {
  let { rate, comment } = req.body;
  const userId = req.user.id;
  const bookId = req.params.bookId;
  let book = await Book.findById(bookId);

  rate = parseInt(rate);

  try {
    let review = await Review.findOne({ userId, bookId });

    if (review) {
      let FirstReview = false;
      if (review.rate == null && rate) {
        FirstReview = true;
        book.total_reviews += 1;
        await book.save();
      }
      if (rate) review.rate = rate;
      if (comment)
        review.comments.push({ text: comment, createdAt: new Date() });
      await review.save();

      return res.status(200).json({ review, FirstReview: FirstReview });
    } else {
      if (!rate && !comment) {
        return res
          .status(400)
          .json({ message: "Please fill the required fields" });
      }

      review = new Review({
        userId,
        bookId,
        rate: rate || null,
        comments: comment ? [{ text: comment, createdAt: new Date() }] : [],
      });
      book.total_reviews += rate ? 1 : 0;

      await book.save();

      await review.save();
      return res.status(201).json({ review, FirstReview: rate ? true : false });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to save review", error: error.message });
  }
};

const getRate = async (req, res) => {
  const { bookId } = req.params;
  const userId = req.user.id;

  try {
    const review = await Review.findOne({ userId, bookId });
    const rate = review ? review.rate : null;
    res.status(200).json(rate);
  } catch (err) {
    console.error("Error fetching rate:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  getReadingStatus,
  updateReadingStatus,
  getReviews,
  getRate,
  addReview,
};
