const jwt = require("jsonwebtoken");

// Verify the bearer token and attach its user ID and role to the request.
function authenticateToken(req, res, next) {
  const authorization = req.headers.authorization;
  const token = authorization && authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ error: "Authentication is required." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch (error) {
    return res.status(401).json({ error: "Your login token is invalid or expired." });
  }
}

module.exports = authenticateToken;
