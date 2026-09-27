const { Router } = require("express");
const { body } = require("express-validator");
const savedLocationController = require("../controllers/savedLocation.controller");
const { authenticate } = require("../middleware/auth");
const { checkBandOwnership } = require("../middleware/ownership");
const validate = require("../middleware/validate");

const router = Router({ mergeParams: true });

const createValidation = [
  body("name").trim().isLength({ min: 1, max: 100 }).withMessage("Name required (max 100 chars)"),
  body("lat").isFloat({ min: -90, max: 90 }).withMessage("Valid latitude required"),
  body("lng").isFloat({ min: -180, max: 180 }).withMessage("Valid longitude required"),
  body("radiusM").optional().isInt({ min: 10, max: 10000 }).withMessage("Radius must be 10-10000 meters"),
  body("safeRadiusM").optional().isInt({ min: 10, max: 10000 }).withMessage("Safe radius must be 10-10000 meters"),
  body("warningRadiusM").optional().isInt({ min: 10, max: 10000 }).withMessage("Warning radius must be 10-10000 meters"),
];

const updateValidation = [
  body("name").optional().trim().isLength({ min: 1, max: 100 }),
  body("lat").optional().isFloat({ min: -90, max: 90 }),
  body("lng").optional().isFloat({ min: -180, max: 180 }),
  body("radiusM").optional().isInt({ min: 10, max: 10000 }),
  body("safeRadiusM").optional().isInt({ min: 10, max: 10000 }),
  body("warningRadiusM").optional().isInt({ min: 10, max: 10000 }),
];

router.use(authenticate);

router.get("/:id/locations", checkBandOwnership, savedLocationController.list);
router.post("/:id/locations", checkBandOwnership, createValidation, validate, savedLocationController.create);
router.patch("/locations/:id", updateValidation, validate, savedLocationController.update);
router.delete("/locations/:id", savedLocationController.remove);
router.post("/locations/:id/activate", savedLocationController.activate);

module.exports = router;
