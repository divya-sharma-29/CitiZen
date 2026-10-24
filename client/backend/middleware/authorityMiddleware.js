function authorityOnly(req, res, next) {
  if (
    !req.user ||
    (
      req.user.role !== "authority" &&
      req.user.role !== "admin"
    )
  ) {
    return res.status(403).json({
      message: "Authority access required",
    });
  }

  next();
}

module.exports = authorityOnly;