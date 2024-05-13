const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin")


// GET /admin/add-product
router.get("/add-product",adminController.getAddProduct)

// POST /admin/add-product
router.post("/add-product",adminController.postAddProduct);

// GET /admin/edit-product
router.get("/edit-product/:productId",adminController.getEditProduct);

router.post("/edit-product", adminController.postEditProduct);

// GET /admin/products
router.get("/products",adminController.getAdminProduct);

router.post("/delete-product", adminController.deleteProduct)

module.exports = router;

