const Product = require('../models/product')
exports.getAddProduct=(req, res, next) => {
    res.render("admin/add-product", {
      pageTitle: "Add Product", 
      path: "/admin/add-product", // pug
      formCss: true, // handlebar
      productCss: true, // handlebar
      activeAddProduct:true // handlebar
    });
}

exports.getAdminProduct=(req, res, next) => {
  Product.fetchAll((proucts)=>{
    res.render("admin/product", {
      pageTitle: "Admin Products", 
      path: "/admin/products", // pug
      formCss: true, // handlebar
      productCss: true, // handlebar
      activeAddProduct:true, // handlebar
      products: proucts
    });

  })
  
}

exports.postAddProduct= (req, res, next) => {
    const product = new Product(req.body.title);
    product.save()
    res.redirect("/products");
  }

exports.getProducts=(req, res, next) => {
  Product.fetchAll((products)=>{
    res.render("shop/product-list", {
      products: products,
      pageTitle: "Shop", ///pug
      path: "/products", //pug
      hasProducts: products.length > 0, // handlebar
      activeShop: true, // handlebar
      productCss: true // handlebar
    }); 
  })
    
  }
