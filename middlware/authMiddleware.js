const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = (req, res, next) => {
  if (req.mothod === "OPTIONS") {
    return next();
  }

  try {
    const token = req.headers.authorization;
    if (!token) {
      res.status(401).json({ message: "Auth error" });
      return next();
    }
    const decoded = jwt.verify(token, config.get("secretKey"));
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    // res.status(401).json({ message: 'Token was expired' })
    return res.status(401).json({ message: "Auth error" });
  }
};
