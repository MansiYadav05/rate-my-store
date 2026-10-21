const express = require("express");
const { body } = require("express-validator");
const authenticateToken = require("../middleware/auth");
const validateRequest = require("../middleware/validate");
const { newPasswordRule } = require("../middleware/validators");
const { changePassword } = require("../controllers/userController");

const router = express.Router();

// Verify the current password and validate the requested new password.
router.put(
  "/password",
  authenticateToken,
  [
    body("currentPassword").isString().notEmpty().withMessage("Current password is required."),
    newPasswordRule,
    validateRequest,
  ],
  changePassword
);

module.exports = router;
