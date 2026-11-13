const { permissions } = require("../config/permissions");

function authorize(action) {
  return (req, res, next) => {
    const allowedRoles = permissions[action];

    if (!allowedRoles) {
      return res.status(500).json({ error: `Unknown permission: ${action}` });
    }

    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ error: "Forbidden: you do not have permission" });
    }

    next();
  };
}

module.exports = { authorize };
