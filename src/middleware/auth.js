const JWT = require("jsonwebtoken");
const Auth = require("../models/Auth");

const userAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).send("Please login");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).send("Token missing");
    }

    const decodedData = JWT.verify(token, process.env.JWT_SECRET);

    const user = await Auth.findById(decodedData._id);
    if (!user) {
      throw new Error("User not found");
    }

    const deviceId = req.headers["device-id"];
    const deviceType = req.headers["device-type"];
    const timezone = req.headers["timezone"];

    if (!deviceId || !deviceType || !timezone) {
      return res.status(400).send("Device information or timezone missing");
    }

    req.user = user;
    req.device = {
      id: deviceId,
      type: deviceType,
      timezone: timezone,
    };

    next();
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

module.exports = userAuth;
