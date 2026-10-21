const express = require("express");
const { body } = require("express-validator");
const authenticateToken = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const validateRequest = require("../middleware/validate");
const {listStores, saveRating, getOwnerDashboard,} = require("../controllers/storeController");

const router = express.Router();

// List stores and ratings for signed-in normal users.
router.get("/", authenticateToken, allowRoles("user"), listStores);

// Validate and save a user's rating for a store.
router.post(
  "/ratings",
  authenticateToken,
  allowRoles("user"),
  [
    body("storeId").isInt({ min: 1 }).withMessage("Choose a valid store."),
    body("rating").isInt({ min: 1, max: 5 }).withMessage("Rating must be an integer from 1 to 5."),
    validateRequest,
  ],
  saveRating
);

// Return stores and ratings belonging to the signed-in owner.
router.get(
  "/owner/dashboard",
  authenticateToken,
  allowRoles("owner"),
  getOwnerDashboard
);

module.exports = router;
