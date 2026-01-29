const jwt = require("jsonwebtoken");

const generateToken = (payload, secret, expiry) => {
  return jwt.sign(payload, secret, { expiresIn: expiry });
};

module.exports = { generateToken };
