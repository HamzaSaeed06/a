const bandService = require("../services/band.service");

const register = async (req, res, next) => {
  try {
    const result = await bandService.register(req.user.id, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const list = async (req, res, next) => {
  try {
    const bands = await bandService.listByOwner(req.user.id);
    res.json({ success: true, data: bands });
  } catch (error) {
    next(error);
  }
};

const getById = async (req, res, next) => {
  try {
    const band = await bandService.getById(req.params.id, req.user.id);
    res.json({ success: true, data: band });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const band = await bandService.update(req.params.id, req.user.id, req.body);
    res.json({ success: true, data: band });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await bandService.remove(req.params.id, req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, list, getById, update, remove };
