const jwt = require("jsonwebtoken");
const config = require("../config");
const AppError = require("../utils/AppError");
const { getDB, toObjectId } = require("../utils/mongo");

const authenticate = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, config.jwt.secret);

    const db = getDB();
    const user = await db.collection("users").findOne({ _id: toObjectId(decoded.userId) });
    if (!user) {
      throw new AppError("User not found", 401);
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    };
    next();
  } catch (error) {
    if (error instanceof AppError) return next(error);
    if (error.name === "JsonWebTokenError") return next(new AppError("Invalid token", 401));
    if (error.name === "TokenExpiredError") return next(new AppError("Token expired", 401));
    next(error);
  }
};

module.exports = { authenticate };
