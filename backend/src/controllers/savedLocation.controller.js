const savedLocationService = require("../services/savedLocation.service");

const list = async (req, res, next) => {
  try {
    const locations = await savedLocationService.listByBand(req.params.id, req.user.id);
    res.json({ success: true, data: locations });
  } catch (error) {
    next(error);
  }
};

const create = async (req, res, next) => {
  try {
    const location = await savedLocationService.create(req.params.id, req.user.id, req.body);
    res.status(201).json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const location = await savedLocationService.update(req.params.id, req.user.id, req.body);
    res.json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await savedLocationService.remove(req.params.id, req.user.id);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const activate = async (req, res, next) => {
  try {
    const location = await savedLocationService.activate(req.params.id, req.user.id);
    res.json({ success: true, data: location });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, create, update, remove, activate };
