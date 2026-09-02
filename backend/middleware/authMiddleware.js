const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    // Get Authorization header
    const authHeader = req.headers.authorization;

    // Check whether token exists
    if (!authHeader) {
      return res.status(401).json({
        message: "Not authorized. Token not provided."
      });
    }

    // Expected format: Bearer TOKEN
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Not authorized. Invalid token format."
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Store logged-in user's ID in request
    req.userId = decoded.userId;

    // Continue to the next controller
    next();

  } catch (error) {
    return res.status(401).json({
      message: "Not authorized. Invalid or expired token."
    });
  }
};

module.exports = authMiddleware;