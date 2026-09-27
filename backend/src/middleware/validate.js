const { validationResult } = require("express-validator");
const AppError = require("../utils/AppError");

const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new AppError("Validation failed", 400, details));
  }
  next();
};

module.exports = validate;
