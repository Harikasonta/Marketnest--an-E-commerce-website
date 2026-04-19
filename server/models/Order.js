const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  items: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: {
        type: Number,
        default: 1
      }
    }
  ],

  total: {
    type: Number,
    required: true
  },

  // ✅ DELIVERY DETAILS
  name: {
    type: String,
    required: true
  },

  phone: {
    type: String,
    required: true
  },

  address: {
    type: String,
    required: true
  },

  // ✅ PAYMENT
  paymentMethod: {
    type: String,
    enum: ["COD", "UPI", "CARD"],
    default: "COD"
  },

  // ✅ ORDER STATUS
  status: {
    type: String,
    enum: ["Placed", "Shipped", "Delivered", "Cancelled"],
    default: "Placed"
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);