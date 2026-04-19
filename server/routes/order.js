const express = require("express");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  isValidIndianPhone,
  normalizePhone,
  isValidAddress
} = require("../utils/validators");

const router = express.Router();

// ================= PLACE ORDER =================
router.post("/place", authMiddleware, async (req, res) => {
  try {
    const { name, phone, address, paymentMethod } = req.body;

    if (!name || !phone || !address || !paymentMethod) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!isValidIndianPhone(phone)) {
      return res.status(400).json({
        message: "Please enter a valid 10-digit Indian phone number"
      });
    }

    if (!isValidAddress(address)) {
      return res.status(400).json({
        message: "Please enter a complete address with house number, street/area, and city"
      });
    }

    const user = await User.findById(req.user.userId)
      .populate("cart.product");

    if (!user || user.cart.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    let total = 0;

    // 🧠 Calculate total + update stock
    for (let item of user.cart) {
      const product = await Product.findById(item.product._id);

      if (!product || product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.name} is out of stock`
        });
      }

      // reduce stock
      product.stock -= item.quantity;

      // increase sold count
      product.sold += item.quantity;

      await product.save();

      total += product.price * item.quantity;
    }

    // 💰 Payment logic
    const paymentStatus =
      paymentMethod === "UPI" ? "Paid" : "Pending";

    const order = new Order({
  user: user._id,

  items: user.cart.map(item => ({
    product: item.product._id,
    quantity: item.quantity
  })),

  total: total,   // ✅ FIXED (was totalAmount ❌)

  name,
  phone: normalizePhone(phone),
  address: address.trim(),

  paymentMethod,

  status: "Placed"   // ✅ FIXED (was orderStatus ❌)
});

    await order.save();

    // 🔗 link order to user
    user.orders.push(order._id);

    // 🧹 clear cart
    user.cart = [];

    await user.save();

    res.json({
      message: "Order placed successfully",
      order
    });

  } catch (err) {
    console.log("ORDER ERROR:", err);
    res.status(500).json({ message: "Error placing order" });
  }
});

// ================= GET USER ORDERS =================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// ================= ADMIN: GET ALL ORDERS =================
router.get("/admin/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.product")
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(orders);

  } catch (err) {
    res.status(500).json({ message: "Error fetching all orders" });
  }
});

// ================= ADMIN: UPDATE ORDER STATUS =================
router.put("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;

    await order.save();

    res.json({ message: "Order updated", order });

  } catch (err) {
    res.status(500).json({ message: "Error updating order" });
  }
});

// ================= ADMIN: REVENUE =================
router.get("/admin/revenue", async (req, res) => {
  try {
    const orders = await Order.find({
      status: "Delivered"   // ✅ only delivered orders
    });

    const revenue = orders.reduce(
      (sum, order) => sum + order.total,   // ✅ FIXED
      0
    );

    res.json({ revenue });

  } catch (err) {
    res.status(500).json({ message: "Error calculating revenue" });
  }
});

module.exports = router;
