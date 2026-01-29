const express = require("express");
const router = express.Router();
const {
  register,
  login,
  refreshToken,
  getMe,
} = require("../controllers/authController");
const verifyToken = require("../middlewares/authMiddleware");

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);
router.get("/me", verifyToken, getMe);

module.exports = router;
