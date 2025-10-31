const UnauthorizedError = require("../errors/unauthorized");
const jwt = require("jsonwebtoken");
const config = require("../config");
const User = require("../api/users/users.model");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers["x-access-token"];
    if (!token) {
      throw "not token";
    }
    const decoded = jwt.verify(token, config.secretJwtToken);

    // Récupérer toutes les informations de l'utilisateur (sans le mot de passe)
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      throw "User not found";
    }

    req.user = user;
    next();
  } catch (message) {
    next(new UnauthorizedError(message));
  }
};
