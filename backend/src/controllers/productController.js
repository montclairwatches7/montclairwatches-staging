const Product = require("../models/productModel");

const getProducts = async (req, res) => {
  try {
    const products = await Product.findAll();

    const structuredProducts = products.map((p) => ({
      ...p,
      price: parseFloat(p.price),
      mrp: p.mrp ? parseFloat(p.mrp) : null,
    }));

    res.json(structuredProducts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database Error", details: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (product) {
      const structuredProduct = {
        ...product,
        price: parseFloat(product.price),
        mrp: product.mrp ? parseFloat(product.mrp) : null,
      };
      res.json(structuredProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Database Error", details: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
};
