const Auth = require("../models/Auth");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const validateSignUpData = require("../utils/validate");
const Address = require("../models/Address");

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

    const userData = user.toObject();
    delete userData.password;
    delete userData.__v;

    const response = {
      ...userData,
      token,
    };

    res.json({
      message: "User Login Successfully",
      data: response,
    });
  } catch (err) {
    res.status(400).send("Error: " + err.message);
  }
};

exports.signUpUser = async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, email, password, age, address } = req.body;

    // Validate address data
    if (!address || !address.location || !address.city || !address.state) {
      return res.status(400).json({
        message: "Address details (location, city and state) are required",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = new Auth({
      firstName,
      lastName,
      email,
      password: hashPassword,
      age,
    });

    const userAddress = new Address({
      location: address.location,
      city: address.city,
      state: address.state,
      userId: user._id, // Link address to user (you'll need to add this field to Address schema)
    });

    const savedUser = await user.save();
    const savedAddress = await userAddress.save();

    const token = JWT.sign({ _id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    const userData = user.toObject();
    delete userData.password;
    delete userData.__v;

    const response = {
      ...userData,
      address: savedAddress,
      token,
    };

    res.status(201).json({
      message: "User and address added successfully",
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

    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (pageNumber - 1) * pageLimit;

    const pipeline = [
      { $match: { _id: { $ne: loggedInUserId } } },

      {
        $lookup: {
          from: "addresses",
          localField: "_id",
          foreignField: "userId",
          as: "address",
        },
      },
      {
        $unwind: {
          path: "$address",
          preserveNullAndEmptyArrays: true,
        },
      },
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { firstName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { "address.city": { $regex: search, $options: "i" } },
            { "address.location": { $regex: search, $options: "i" } },
          ],
        },
      });
    }

    pipeline.push(
      {
        $project: {
          password: 0,
          __v: 0,
          "address.__v": 0,
        },
      },
      { $sort: { firstName: 1 } }
    );

    const countPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await Auth.aggregate(countPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    pipeline.push({ $skip: skip }, { $limit: pageLimit });

    const users = await Auth.aggregate(pipeline);

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

exports.deleteAuthUser = async (req, res) => {
  console.log("deleteAuthUser called with params:", req.params);

  try {
    const { userId } = req.params;

    const user = await Auth.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    await Address.deleteOne({ userId: userId });

    await Auth.findByIdAndDelete(userId);

    res.status(200).json({
      message: "User and one associated address deleted successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateAddressAndGetUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "No data provided to update" });
    }

    const updatedAddress = await Address.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true }
    );

    if (!updatedAddress) {
      return res.status(404).json({ error: "Address not found for this user" });
    }

    const user = await Auth.findById(userId).select("-password").lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const addresses = await Address.find({ userId });
    user.addresses = addresses;

    res.status(200).json({
      message: "Address updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
