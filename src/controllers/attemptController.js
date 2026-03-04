const Attempt = require("../models/Attempt");
const Quiz = require("../models/Quiz");
const User = require("../models/User");
const paginate = require("../utils/paginate");

const getUserAttempts = async (req, res) => {
  try {
    const attempts = await paginate(
      Attempt,
      { user: req.user.id, isDeleted: false },
      {
        page: req.query.page,
        limit: req.query.limit,
        select: "-isDeleted -deleteAt",
      },
    );

    if (!attempts || attempts.data.length === 0) {
      return res
        .status(200)
        .json({ message: "Chưa có attempt nào" });
    }

    res.status(200).json(attempts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttemptById = async (req, res) => {
  try {
    const attempt = await Attempt.findOne({ _id: req.params.id, isDeleted: false }).select("-isDeleted -deleteAt");

    if (!attempt) {
      return res
        .status(200)
        .json({ message: "Attempt không tồn tại" });
    }

    if (attempt.user.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ success: false, message: "Bạn không có quyền truy cập attempt này" });
    }
    const quiz = await Quiz.findById(attempt.quiz);
    res.status(200).json({ attempt, quiz });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAttemptByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);

    if (req.user.id !== quiz.owner.toString()) {
      return res
        .status(403)
        .json({ success: false, message: "Bạn không có quyền truy cập attempt này" });
    }

    const attempts = await Attempt.find({quiz: quizId, isDeleted: false})
    .select("-isDeleted -deleteAt")
    .sort({ nameUser: 1, attemptNumber: 1 });

    if (!attempts || attempts.length === 0) {
      return res
        .status(200)
        .json({ success: false, message: "Không tìm thấy attempt nào" });
    }

    res.status(200).json({
      success: true,
      attempts,
      total: attempts.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getUserAttempts,
  getAttemptById,
  getAttemptByQuiz,
};
