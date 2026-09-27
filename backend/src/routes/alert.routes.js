const { Router } = require("express");
const alertController = require("../controllers/alert.controller");
const { authenticate } = require("../middleware/auth");

const router = Router();

router.use(authenticate);
router.get("/", alertController.getAlerts);

module.exports = router;
