const express = require("express");
const { signup, login } = require("../controllers/authController");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const User = require("../models/User");

router.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});



router.post("/signup", signup);
router.post("/login", login);

module.exports = router;
