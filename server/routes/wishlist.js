const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ GET WISHLIST
router.get("/", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId)
    .populate("wishlist");

  res.json(user.wishlist);
});

// ✅ ADD / REMOVE (TOGGLE)
router.post("/:productId", authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.userId);

  const productId = req.params.productId;

  const exists = user.wishlist.includes(productId);

  if (exists) {
    user.wishlist = user.wishlist.filter(
      id => id.toString() !== productId
    );
    await user.save();
    return res.json({ message: "Removed from wishlist" });
  }

  user.wishlist.push(productId);
  await user.save();

  res.json({ message: "Added to wishlist" });
});

module.exports = router;