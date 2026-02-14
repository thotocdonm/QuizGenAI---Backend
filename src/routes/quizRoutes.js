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

// POST /api/quizzes/submit (Không cần token)
router.post("/submit/:id", quizController.submitQuiz);

// PUT /api/quizzes/update (Cần token)
router.put("/update/:id", verifyToken, quizController.updateQuiz);

// POST /api/quiz/:id/start (Cần token)
router.post("/:id/start", verifyToken, quizController.startQuiz);

module.exports = router;
