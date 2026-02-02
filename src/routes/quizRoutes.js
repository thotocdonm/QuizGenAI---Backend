const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const verifyToken = require("../middlewares/authMiddleware");

// POST /api/quizzes/generate (Cần token)
router.post("/generate", verifyToken, quizController.generateQuiz);

// GET /api/quizzes (Cần token)
router.get("/", verifyToken, quizController.getAllQuizzes);

// GET /api/quizzes/:id (Cần token và check owner)
router.get("/:id", verifyToken, quizController.getQuizById);

// GET /api/quizzes/public/:id (Không cần token)
router.get("/public/:id", quizController.getQuizPublic);

module.exports = router;