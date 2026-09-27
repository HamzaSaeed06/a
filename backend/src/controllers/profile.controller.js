const profileService = require("../services/profile.service");

const getProfile = async (req, res, next) => {
  try {
    const profile = await profileService.getProfile(req.params.id, req.user.id);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

const upsertProfile = async (req, res, next) => {
  try {
    const profile = await profileService.upsertProfile(req.params.id, req.user.id, req.body);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProfile, upsertProfile };
