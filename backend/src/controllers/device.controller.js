const deviceService = require("../services/device.service");

const ping = async (req, res, next) => {
  try {
    const result = await deviceService.handlePing(req.deviceCred.bandId, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const sos = async (req, res, next) => {
  try {
    const result = await deviceService.handleSos(req.deviceCred.bandId, req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { ping, sos };
