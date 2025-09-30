const Auth = require("../models/Auth");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const validateSignUpData = require("../utils/validate");

/*
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Auth.findOne({ email: email });
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Password not valid");
    }

    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    res.json({
      message: "User Login Successfully",
      user,
      token,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};
*/

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Auth.findOne({ email: email });
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Password not valid");
    }

    const token = JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    const response = {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        age: user.age,
        city: user.city,
        token: token,
      },
    };

    res.json({
      message: "User Login Successfully",
      data: response,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

/*
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

    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    res.json({
      message: "User added successfully",
      data: savedUser,
      token, // Include token here
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};
*/

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

    const token = JWT.sign({ _id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    const response = {
      user: {
        id: savedUser._id,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        email: savedUser.email,
        age: savedUser.age,
        city: savedUser.city,
        token: token,
      },
    };

    res.status(201).json({
      message: "User added successfully",
      data: response,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

exports.getAuthUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    const loggedInUserId = req.user._id;

    let query = { _id: { $ne: loggedInUserId } };

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (pageNumber - 1) * pageLimit;

    const users = await Auth.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ firstName: 1 })
      .skip(skip)
      .limit(pageLimit);

    const total = await Auth.countDocuments(query);

    if (!users.length) {
      return res.status(404).json({ error: "No users found" });
    }

    res.status(200).json({
      message: "Total Users Present",
      page: pageNumber,
      limit: pageLimit,
      total,
      users: users,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
