const Product = require("../models/product");
const { check, validationResult } = require("express-validator");

exports.getAddProduct = (req, res, next) => {
  if (!req.session.isLoggedIn) {
    return res.redirect("/login");
  }
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product", // pug
    editing: false,
    errorMessage: message,
    oldInput:{title: "", description: "", price: "",imageUrl: ""},
    validationErrors: []
  });
  
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/add-product", {
      pageTitle: "Add Product", ///pug
      path: "/admin/add-product",
      errorMessage: errors.array()[0].msg,
      oldInput:{title: title, description: description,price:price, imageUrl:imageUrl, description: description},
      validationErrors: errors.array()
    });
  }
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
      // console.log("An error occurred");
      // return res.status(500).render("admin/add-product", {
      //   pageTitle: "Add Product", ///pug
      //   path: "/admin/add-product",
      //   editing: false,
      //   hasError: true,
      //   errorMessage: "Database operation failed, please try again.",
      //   oldInput:{title: title, description: description,price:price, imageUrl:imageUrl, description: description},
      //   validationErrors: []
      // });
      // res.redirect("/500")
      const error = new Error(err)
      error.httpStatusCode = 500
      throw next(error)
    });
};

exports.getEditProduct = (req, res, next) => {
  const editmode = req.query.edit;
  console.log(editmode);
  if (!editmode) {
    return res.redirect("/");
  }
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product", // pug
        editing: editmode,
        product: product,
        errorMessage: message,
        oldInput:product,
        validationErrors: []
      });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500
      throw next(error)
    });
};
exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const title = req.body.title;
  const price = req.body.price;
  const imageUrl = req.body.imageUrl;
  const description = req.body.description;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product", ///pug
      path: "/admin/edit-product",
      editing: true,
      errorMessage: errors.array()[0].msg,
      product:{title: title, description: description,price:price, imageUrl:imageUrl, _id:prodId},
      validationErrors: errors.array()
    });
  }
  Product.findById(prodId)
    .then((product) => {
      if(product.userId.toString() !== req.user._id.toString()){
        req.flash("error", "You are not allowed to edit this product");
        return res.redirect('/admin/products')
      }
      product.title = title;
      product.price = price;
      product.description = description;
      product.imageUrl = imageUrl;
      return product.save().then((result) => {
        console.log("Updated product");
        res.redirect("/admin/products");
      })
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500
      throw next(error)
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.deleteOne({_id:prodId, userId:req.user._id})
    .then((result) => {
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err)
    error.httpStatusCode = 500
      throw next(error)
    });
};

exports.getAdminProduct = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  if(req.user){
    Product.find({userId:req.user._id})
    .then((products) => {
      res.render("admin/product", {
        pageTitle: "Admin Products",
        path: "/admin/products", // pug
        products: products,
        errorMessage: message
        
      });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500
      throw next(error)
    });

  }
  
};
