const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const verifyToken = require("../middlewares/authMiddleware");

// POST /api/quiz/generate (Cần token)
router.post("/generate", verifyToken, quizController.generateQuiz);

// GET /api/quiz (Cần token)
router.get("/", verifyToken, quizController.getAllQuizzes);

// GET /api/quiz/public/:id (Không cần token)
router.get("/public/:id", quizController.getQuizPublic);

// GET /api/quiz/:id (Cần token và check owner)
router.get("/:id", verifyToken, quizController.getQuizById);

// PUT /api/quiz/:id (Cần token và check owner)
router.put("/:id", verifyToken, quizController.updateQuiz);

module.exports = router;
