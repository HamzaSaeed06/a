const { Router } = require("express");
const deviceController = require("../controllers/device.controller");
const { authenticateDevice } = require("../middleware/deviceAuth");
const { deviceRateLimit } = require("../middleware/deviceRateLimit");

const router = Router();

router.post("/ping", authenticateDevice, deviceRateLimit("ping"), deviceController.ping);
router.post("/sos", authenticateDevice, deviceRateLimit("sos"), deviceController.sos);

module.exports = router;
