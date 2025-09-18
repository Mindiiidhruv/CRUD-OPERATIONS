const express = require("express");
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  filterByName,
  filterByNameOrEmail,
  sortedList,
  PaginationList,
} = require("../controllers/userController");

const router = express.Router();

router.post("/", createUser);
router.get("/", getUsers);
router.get("/sortUser", sortedList);
router.get("/Pagination", PaginationList);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.get("/name/:name", filterByName);
router.get("/filter/:searchBy", filterByNameOrEmail);

module.exports = router;
