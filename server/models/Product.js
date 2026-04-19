const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
    trim: true
  },

  price: {
    type: Number,
    required: true,
    min: 0
  },

  description: {
    type: String,
    default: ""
  },

  image: {
    type: String,
    default: "https://via.placeholder.com/300"
  },

  category: {
    type: String,
    required: true,
    trim: true
  },

  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },

  // ⭐ NEW: track total sold (for admin analytics)
  sold: {
    type: Number,
    default: 0
  }

}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);