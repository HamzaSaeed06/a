const activityLogService = require("../services/activityLog.service");

const list = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await activityLogService.listByBand(req.params.id, req.user.id, { page, limit });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

const recent = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const logs = await activityLogService.getRecent(req.params.id, req.user.id, limit);
    res.json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = { list, recent };
