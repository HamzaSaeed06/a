const { Router } = require("express");
const activityLogController = require("../controllers/activityLog.controller");
const { authenticate } = require("../middleware/auth");
const { checkBandOwnership } = require("../middleware/ownership");

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get("/:id/activity", checkBandOwnership, activityLogController.list);
router.get("/:id/activity/recent", checkBandOwnership, activityLogController.recent);

module.exports = router;
