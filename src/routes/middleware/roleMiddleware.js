function authorizeRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({ message: "Access denied." });
    }

    if (req.user.role !== role) {
      return res.status(403).json({ message: "Forbidden: Admin only." });
    }

    next();
  };
}

module.exports = authorizeRole;
