const { Router } = require("express");
const { body } = require("express-validator");
const profileController = require("../controllers/profile.controller");
const { authenticate } = require("../middleware/auth");
const { checkBandOwnership } = require("../middleware/ownership");
const validate = require("../middleware/validate");

const router = Router({ mergeParams: true });

const profileValidation = [
  body("name").optional().trim().isLength({ min: 1, max: 100 }),
  body("age").optional().isInt({ min: 1, max: 18 }),
  body("photoUrl").optional().isURL(),
  body("notes").optional().trim().isLength({ max: 500 }),
];

router.use(authenticate);

router.get("/:id/profile", checkBandOwnership, profileController.getProfile);
router.put(
  "/:id/profile",
  checkBandOwnership,
  profileValidation,
  validate,
  profileController.upsertProfile
);

module.exports = router;
