const { validationResult } = require("express-validator");

// Return all express-validator errors before a controller runs.
function validateRequest(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: "Please check the submitted values.",
      details: errors.array().map((item) => ({
        field: item.path,
        message: item.msg,
      })),
    });
  }

  return next();
}

module.exports = validateRequest;
