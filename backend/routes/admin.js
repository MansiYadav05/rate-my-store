const express = require("express");
const { body, param, query } = require("express-validator");
const authenticateToken = require("../middleware/auth");
const allowRoles = require("../middleware/role");
const validateRequest = require("../middleware/validate");
const { nameRule, emailRule, addressRule, passwordRule, } = require("../middleware/validators");
const { getStats, createUser, listUsers, getUser, createStore, listStores } = require("../controllers/adminController");

const router = express.Router();
// Require a valid admin token for every administrator endpoint.
router.use(authenticateToken, allowRoles("admin"));

// Return dashboard totals for administrators.
router.get("/stats", getStats);

// Validate and create a user account with an administrator-selected role.
router.post(
  "/users",
  [nameRule, emailRule, passwordRule, addressRule, body("role").isIn(["admin", "user", "owner"]).withMessage("Choose a valid role."), validateRequest,],
  createUser
);

// Filter and sort users using query parameters.
router.get(
  "/users",
  [query("role").optional({ values: "falsy" }).isIn(["admin", "user", "owner"]).withMessage("Choose a valid role."), validateRequest],
  listUsers
);

// Return a user's details and store-owner rating average.
router.get(
  "/users/:id",
  [param("id").isInt({ min: 1 }).withMessage("Choose a valid user."), validateRequest],
  getUser
);

// Validate and create a store for an existing owner.
router.post(
  "/stores",
  [nameRule, emailRule, addressRule, body("ownerId").isInt({ min: 1 }).withMessage("Choose a valid owner."), validateRequest,],
  createStore
);

// Filter and sort stores, including their average ratings.
router.get("/stores", listStores);

module.exports = router;
