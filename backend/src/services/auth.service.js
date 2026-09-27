const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDB, toObjectId } = require("../utils/mongo");
const config = require("../config");
const AppError = require("../utils/AppError");

const SALT_ROUNDS = 12;

const signup = async ({ email, password, name }) => {
  const db = getDB();
  const existing = await db.collection("users").findOne({ email });
  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  const now = new Date();
  const result = await db.collection("users").insertOne({
    email,
    password: hashedPassword,
    name: name || null,
    created_at: now,
    updated_at: now,
  });

  const user = {
    id: result.insertedId.toString(),
    email,
    name: name || null,
    createdAt: now,
  };

  const token = jwt.sign({ userId: user.id }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  return { user, token };
};

const login = async ({ email, password }) => {
  const db = getDB();
  const user = await db.collection("users").findOne({ email });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = jwt.sign({ userId: user._id.toString() }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      createdAt: user.created_at,
    },
    token,
  };
};

const updateProfile = async (userId, { name, phone, password, contacts, preferences }) => {
  const db = getDB();
  const oid = toObjectId(userId);
  if (!oid) throw new AppError("User not found", 404);

  const updates = { updated_at: new Date() };
  if (name !== undefined) updates.name = name;
  if (phone !== undefined) updates.phone = phone;
  if (contacts !== undefined) updates.contacts = contacts;
  if (preferences !== undefined) updates.preferences = preferences;
  if (password) {
    updates.password = await bcrypt.hash(password, SALT_ROUNDS);
  }

  await db.collection("users").updateOne({ _id: oid }, { $set: updates });

  const updatedUser = await db.collection("users").findOne({ _id: oid });
  return {
    id: updatedUser._id.toString(),
    email: updatedUser.email,
    name: updatedUser.name,
    phone: updatedUser.phone || null,
    contacts: updatedUser.contacts || [],
    preferences: updatedUser.preferences || {},
  };
};


module.exports = { signup, login, updateProfile };

