// Allow a request only when the signed-in user has one of the listed roles.
function allowRoles(...allowedRoles) {
  return function checkRole(req, res, next) {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "You do not have permission to do this." });
    }

    return next();
  };
}

module.exports = allowRoles;
