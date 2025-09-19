const User = require("../models/Users");

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(200).json({ message: "User created successfully", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const pageNumber = parseInt(page);
    const pageLimit = parseInt(limit);
    const skip = (pageNumber - 1) * pageLimit;

    const users = await User.find(query)
      .collation({ locale: "en", strength: 2 })
      .sort({ name: 1 })
      .skip(skip)
      .limit(pageLimit);

    const total = await User.countDocuments(query);

    if (!users.length) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "Total Users Present",
      page: pageNumber,
      limit: pageLimit,
      total,
      users,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User found successfully", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User data updated successfully", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.status(200).json({ message: "User deleted successfully", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
