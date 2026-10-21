const express = require("express");
const { body } = require("express-validator");
const { signup, login } = require("../controllers/authController");
const validateRequest = require("../middleware/validate");
const { nameRule, emailRule, addressRule, passwordRule, } = require("../middleware/validators");

const router = express.Router();

// Validate signup fields, then create a normal user account.
router.post(
  "/signup",
  [nameRule, emailRule, passwordRule, addressRule, validateRequest],
  signup
);

// Validate login credentials, then return a JWT.
router.post(
  "/login",
  [
    body("email").trim().isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
    body("password").isString().notEmpty().withMessage("Password is required."),
    validateRequest,
  ],
  login
);

module.exports = router;
