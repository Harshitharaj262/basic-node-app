const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin")
const isAuth = require('../middlerware/is-auth')
const validate = require("../middlerware/is-validate");


// GET /admin/add-product
router.get("/add-product",isAuth,adminController.getAddProduct)

// POST /admin/add-product
router.post("/add-product",isAuth, validate.checkAddProduct(), adminController.postAddProduct);

// GET /admin/edit-product
router.get("/edit-product/:productId",isAuth,adminController.getEditProduct);


router.post("/edit-product",isAuth, validate.checkAddProduct(),adminController.postEditProduct);

// GET /admin/products
router.get("/products",isAuth,adminController.getAdminProduct);

router.post("/delete-product",isAuth, adminController.deleteProduct)

module.exports = router;

