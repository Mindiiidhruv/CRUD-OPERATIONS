const User = require("../models/Users");

exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully", user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.filterByName = async (req, res) => {
  try {
    const { name } = req.params;

    const users = await User.find({
      name: { $regex: name, $options: "i" },
    });

    if (!users || users.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    res.json({ message: "Filtered Users", users });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.filterByNameOrEmail = async (req, res) => {
  try {
    let { searchBy } = req.params;
    if (!searchBy)
      return res.status(400).json({ error: "Keyword is required" });

    const users = await User.find({
      $or: [
        { name: { $regex: String(searchBy), $options: "i" } },
        { email: { $regex: String(searchBy), $options: "i" } },
      ],
    });

    if (!users.length) {
      return res.status(404).json({ error: "No users found" });
    }

    res.json({ message: "Filtered Users", users });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.sortedList = async (req, res) => {
  try {
    const sortedUser = await User.find().sort({ name: 1 });

    if (sortedUser.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    res.json({ message: "Sorted list of users", users: sortedUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.PaginationList = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const users = await User.find().skip(skip).limit(limit);

    if (users.length === 0) {
      return res.status(404).json({ error: "No users found" });
    }

    res.json({
      page,
      limit,
      total: users.length,
      users,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
