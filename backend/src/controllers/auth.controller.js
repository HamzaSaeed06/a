const authService = require("../services/auth.service");

const signup = async (req, res, next) => {
  try {
    const { user, token } = await authService.signup(req.body);
    res.status(201).json({ success: true, data: { user, token } });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    res.json({ success: true, data: { user, token } });
  } catch (error) {
    next(error);
  }
};

const logout = async (_req, res) => {
  res.json({ success: true, message: "Logged out successfully" });
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: { user } });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  const db = require("../utils/mongo").getDB();
  const user = await db.collection("users").findOne({ _id: require("../utils/mongo").toObjectId(req.user.id) });
  res.json({
    success: true,
    data: {
      user: {
        id: req.user.id,
        email: req.user.email,
        name: user?.name || req.user.name,
        phone: user?.phone || null,
        contacts: user?.contacts || [],
        preferences: user?.preferences || {},
      },
    },
  });
};


module.exports = { signup, login, logout, me, updateProfile };

