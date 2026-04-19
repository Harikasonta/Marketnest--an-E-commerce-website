const express = require("express");
const Product = require("../models/Product");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// ================= ENSURE UPLOADS FOLDER EXISTS =================
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// ================= MULTER CONFIG =================
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname);

    if (!ext) {
      ext = ".jpg";
    }

    cb(null, Date.now() + ext);
  }
});

const upload = multer({ storage });


// ================= ADD PRODUCT =================
router.post("/", authMiddleware, adminMiddleware, upload.single("image"), async (req, res) => {
  try {
    const { name, price, category, stock, description } = req.body;

    if (!name || !price || !category || !stock) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const product = new Product({
      name,
      price: Number(price),
      category: category.toLowerCase().trim(), // normalize
      description: description ? description.trim() : "",
      stock,
      image: req.file ? `/uploads/${req.file.filename}` : ""
    });

    await product.save();

    res.status(201).json({
      message: "Product added successfully",
      product
    });

  } catch (err) {
    console.error("ADD PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


// ================= GET ALL PRODUCTS =================
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= GET SIMILAR PRODUCTS =================
router.get("/similar/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const similarProducts = await Product.find({
      _id: { $ne: product._id },
      category: product.category
    })
      .sort({ createdAt: -1 })
      .limit(8);

    res.json(similarProducts);
  } catch (err) {
    console.error("GET SIMILAR PRODUCTS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

// ================= GET SINGLE PRODUCT =================
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


// ================= UPDATE PRODUCT =================
router.put("/:id", authMiddleware, adminMiddleware, upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      price: Number(req.body.price),
      category: req.body.category?.toLowerCase().trim(),
      description: req.body.description ? req.body.description.trim() : "",
      stock: req.body.stock
    };

    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({ message: "Updated", updatedProduct });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


// ================= DELETE PRODUCT =================
router.delete("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});


// ================= SEARCH PRODUCTS (FINAL AI-FIXED VERSION) =================
router.post("/search", async (req, res) => {
  const { product, price } = req.body;

  try {
    let products = await Product.find();

    // 👇 THIS IS WHERE YOU FIX
    const prod = product ? product.toLowerCase().trim() : "";

    console.log("PRODUCT RECEIVED:", product);
    console.log("PROD AFTER CLEAN:", prod);

    let filtered = products.filter((p) => {
      const matchPrice = !price || Number(p.price) <= Number(price);

      let matchProduct = false;

      if (!product) {
        matchProduct = true;
      }

      else if (
        prod.includes("phone") ||
        prod.includes("mobile")
      ) {
        matchProduct =
          p.category.toLowerCase().includes("electronics") ||
          /vivo|oppo|iphone|samsung/.test(p.name.toLowerCase());
      }

      else if (prod.includes("book")) {
        matchProduct = p.category.toLowerCase().includes("books");
      }

      else {
        matchProduct =
          p.name.toLowerCase().includes(prod) ||
          p.category.toLowerCase().includes(prod);
      }

      return matchPrice && matchProduct;
    });

    res.json(filtered);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
