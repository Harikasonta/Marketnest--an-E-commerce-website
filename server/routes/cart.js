const express = require("express");
const User = require("../models/User");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ================= ADD TO CART =================
router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { productId } = req.body;
    const quantity = req.body.quantity || 1;

    if (!productId) {
      return res.status(400).json({ message: "Product ID required" });
    }

    const productExists = await Product.findById(productId);
    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    const user = await User.findById(req.user.userId);

    if (!user.cart) user.cart = [];

    const itemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex > -1) {
      user.cart[itemIndex].quantity += quantity;
    } else {
      user.cart.push({
        product: productId,
        quantity: quantity
      });
    }

    await user.save();

    res.json({
      message: "Item added to cart",
      cart: user.cart
    });

  } catch (err) {
    console.log("ADD CART ERROR:", err);
    res.status(500).json({ message: "Error adding to cart" });
  }
});

// ================= GET CART =================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("cart.product");

    res.json(user.cart || []);

  } catch (err) {
    console.log("GET CART ERROR:", err);
    res.status(500).json({ message: "Error fetching cart" });
  }
});

// ================= UPDATE QUANTITY =================
router.put("/update", authMiddleware, async (req, res) => {
  try {
    const { productId, change } = req.body;

    const user = await User.findById(req.user.userId);

    const itemIndex = user.cart.findIndex(
      item => item.product.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found" });
    }

    user.cart[itemIndex].quantity += change;

    if (user.cart[itemIndex].quantity <= 0) {
      user.cart.splice(itemIndex, 1);
    }

    await user.save();

    res.json({
      message: "Cart updated",
      cart: user.cart
    });

  } catch (err) {
    console.log("UPDATE CART ERROR:", err);
    res.status(500).json({ message: "Error updating cart" });
  }
});

// ================= REMOVE ITEM =================
router.delete("/:productId", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    user.cart = user.cart.filter(
      item => item.product.toString() !== req.params.productId
    );

    await user.save();

    res.json({
      message: "Item removed",
      cart: user.cart
    });

  } catch (err) {
    console.log("REMOVE CART ERROR:", err);
    res.status(500).json({ message: "Error removing item" });
  }
});

// ================= CLEAR CART (🔥 NEW FOR ORDERS) =================
router.delete("/clear/all", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    user.cart = [];  // 🧹 clear cart after order

    await user.save();

    res.json({ message: "Cart cleared" });

  } catch (err) {
    console.log("CLEAR CART ERROR:", err);
    res.status(500).json({ message: "Error clearing cart" });
  }
});

module.exports = router;