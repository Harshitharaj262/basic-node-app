const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  res.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product", // pug
    editing: false
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product({
    title: title,
    description: description,
    price: price,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then((result) => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editmode = req.query.edit;
  console.log(editmode);
  if (!editmode) {
    return res.redirect("/");
  }
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product", // pug
        editing: editmode,
        product: product
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  Product.findById(prodId)
    .then((product) => {
      product.title = title;
      product.price = price;
      product.description = description;
      product.imageUrl = imageUrl;
      return product.save();
    })
    .then((result) => {
      console.log("Updated product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndDelete(prodId)
    .then((result) => {
      console.log("Product deleted");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getAdminProduct = (req, res, next) => {
  Product.find()
    // control which fields needs to be fetched
    // .select('title price -_id')
    // get data from ref field
    // .populate('userId','name')
    .then((products) => {
      res.render("admin/product", {
        pageTitle: "Admin Products",
        path: "/admin/products", // pug
        products: products
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
