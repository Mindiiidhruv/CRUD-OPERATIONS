const Auth = require("../models/Auth");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const validateSignUpData = require("../utils/validate");

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Auth.findOne({ email: email });
    if (!user) {
      throw new Error("User not found");
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (isPasswordValid) {
      const Token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET);
      console.log(Token);
      res.cookie("Token", Token, {
        expires: new Date(Date.now() + 8 * 3600000),
      });
      res.json({ message: "User Login Successfully", user });
    } else {
      throw new Error("Password not valid");
    }
  } catch (err) {
    res.status(400).send("Error :" + err.message);
  }
};

exports.signUpUser = async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, email, password, age, city } = req.body;

    const hashPassword = await bcrypt.hash(password, 10);

    const user = new Auth({
      firstName,
      lastName,
      email,
      password: hashPassword,
      age,
      city,
    });

    const savedUser = await user.save();

    const Token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET);

    console.log(Token);
    res.cookie("Token", Token, { expires: new Date(Date.now() + 8 * 3600000) });

    res.json({ message: "User added successfully", data: savedUser });
  } catch (err) {
    res.status(400).send("Error : " + err.message);
  }
};

exports.logoutUser = async (req, res) => {
  res.cookie("Token", null, { expires: new Date(Date.now()) });
  res.send("Logout successfully");
};
