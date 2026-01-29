const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../utils/jwtHelper");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.error("Email already exists", 400);

    const user = await User.create({ email, password, fullName });
    res.success(
      { id: user._id, name: user.fullName, email: user.email },
      "User registered successfully",
    );
  } catch (error) {
    res.error(error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.error("Invalid email or password", 401);
    }

    const accessToken = generateToken(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_TOKEN_EXPIRY,
    );
    const refreshToken = generateToken(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      process.env.REFRESH_TOKEN_EXPIRY,
    );

    user.refreshToken = refreshToken;
    await user.save();

    const resData = {
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.fullName,
        email: user.email,
      },
    };

    res.success(resData, "Login successful");
  } catch (error) {
    res.error(error.message);
  }
};

const refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.error("Refresh token required", 400);

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.error("Invalid refresh token", 403);
    }

    const newAccessToken = generateToken(
      { id: user._id },
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_TOKEN_EXPIRY,
    );

    const newRefreshToken = generateToken(
      { id: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      process.env.REFRESH_TOKEN_EXPIRY,
    );
    res.success(
      { accessToken: newAccessToken, refreshToken: newRefreshToken },
      "Token renewed",
    );
  } catch (error) {
    res.error("Expired or invalid refresh token", 403);
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select(
      "-password -refreshToken",
    );
    res.success(user, "User info retrieved");
  } catch (error) {
    res.error(error.message);
  }
};

module.exports = { register, login, refreshToken, getMe };
