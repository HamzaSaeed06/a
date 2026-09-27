const app = require("../src/app");
const { connectDB } = require("../src/utils/mongo");

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error("Vercel DB connection error:", err);
  }
  return app(req, res);
};
