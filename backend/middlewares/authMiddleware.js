const jwt = require("jsonwebtoken")

module.exports = function (req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).send({
        message: "Authorization header missing",
        data: null,
        success: false
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).send({
        message: "Token missing",
        data: null,
        success: false
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userid = decoded.userid;
    next();
  }
  catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).send({
      message: error.message || "Authentication failed",
      data: null,
      success: false
    });
  }
}