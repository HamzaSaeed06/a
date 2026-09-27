const sosService = require("../services/sos.service");

const trigger = async (req, res, next) => {
  try {
    const { lat, lng } = req.body || {};
    const result = await sosService.triggerSos(req.params.id, req.user.id, lat, lng);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const resolve = async (req, res, next) => {
  try {
    const result = await sosService.resolveSos(req.params.id, req.user.id, req.params.sosEventId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { trigger, resolve };

