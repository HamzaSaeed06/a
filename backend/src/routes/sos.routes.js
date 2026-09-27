const { Router } = require("express");
const sosController = require("../controllers/sos.controller");
const { authenticate } = require("../middleware/auth");
const { checkBandOwnership } = require("../middleware/ownership");

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post("/:id/sos", checkBandOwnership, sosController.trigger);
router.post("/:id/sos/resolve", checkBandOwnership, sosController.resolve);
router.post("/:id/sos/:sosEventId/resolve", checkBandOwnership, sosController.resolve);

module.exports = router;

