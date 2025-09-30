const express = require("express");
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const {
  loginUser,
  signUpUser,
  getAuthUsers,
} = require("../controllers/authController");

const userAuth = require("../middleware/auth");

const router = express.Router();

router.post("/", userAuth, createUser);
router.get("/", userAuth, getUsers);
router.get("/authUser", userAuth, getAuthUsers);
router.post("/Login", loginUser);
router.post("/SignUp", signUpUser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
