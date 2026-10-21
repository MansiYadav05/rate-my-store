const { body } = require("express-validator");

const nameRule = body("name")
  .trim()
  .isLength({ min: 20, max: 60 })
  .withMessage("Name must be between 20 and 60 characters.");

const emailRule = body("email")
  .trim()
  .isEmail()
  .withMessage("Enter a valid email address.")
  .normalizeEmail();

const addressRule = body("address")
  .optional({ values: "undefined" })
  .isString()
  .withMessage("Address must be text.")
  .bail()
  .isLength({ max: 400 })
  .withMessage("Address must be at most 400 characters.");

const passwordRule = body("password")
  .isLength({ min: 8, max: 16 })
  .withMessage("Password must be between 8 and 16 characters.")
  .bail()
  .matches(/[A-Z]/)
  .withMessage("Password must include an uppercase letter.")
  .bail()
  .matches(/[^A-Za-z0-9\s]/)
  .withMessage("Password must include a special character.");

const newPasswordRule = body("newPassword")
  .isLength({ min: 8, max: 16 })
  .withMessage("Password must be between 8 and 16 characters.")
  .bail()
  .matches(/[A-Z]/)
  .withMessage("Password must include an uppercase letter.")
  .bail()
  .matches(/[^A-Za-z0-9\s]/)
  .withMessage("Password must include a special character.");

module.exports = {
  nameRule,
  emailRule,
  addressRule,
  passwordRule,
  newPasswordRule,
};
