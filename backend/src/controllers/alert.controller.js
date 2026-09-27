const alertService = require("../services/alert.service");

const getAlerts = async (req, res, next) => {
  try {
    const alerts = await alertService.getAlerts(req.user.id);
    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAlerts };
