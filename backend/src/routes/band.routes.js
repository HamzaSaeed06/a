const { Router } = require("express");
const { body } = require("express-validator");
const bandController = require("../controllers/band.controller");
const { authenticate } = require("../middleware/auth");
const { checkBandOwnership } = require("../middleware/ownership");
const validate = require("../middleware/validate");

const router = Router();

const registerValidation = [
  body("nickname").trim().isLength({ min: 1, max: 100 }).withMessage("Nickname required (max 100 chars)"),
  body("deviceType").optional().isIn(["band", "simulator"]).withMessage("deviceType must be 'band' or 'simulator'"),
];

const updateValidation = [
  body("nickname").optional().trim().isLength({ min: 1, max: 100 }),
  body("safeRadiusM").optional().isInt({ min: 10, max: 10000 }),
  body("warningRadiusM").optional().isInt({ min: 10, max: 10000 }),
];

router.use(authenticate);

router.post("/register", registerValidation, validate, bandController.register);
router.get("/", bandController.list);
router.get("/:id", checkBandOwnership, bandController.getById);
router.patch("/:id", checkBandOwnership, updateValidation, validate, bandController.update);
router.delete("/:id", checkBandOwnership, bandController.remove);

module.exports = router;
