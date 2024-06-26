const Product = require("../models/product");
const { check, validationResult } = require("express-validator");
const fileHelper = require("../utils/file")

const ITEMS_PER_PAGE = 2
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
    oldInput:{title: "", description: "", price: "",image: ""},
    validationErrors: []
  });
  
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const image = req.file;
  const price = req.body.price;
  const description = req.body.description;
  if (!image){
    return res.status(422).render("admin/add-product", {
      pageTitle: "Add Product", ///pug
      path: "/admin/add-product",
      editing: false,
      hasErrors: true,
      errorMessage: "Attached file is not an image.",
      oldInput:{title: title, description: description,price:price, image:image, description: description},
      validationErrors: []
    });
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/add-product", {
      pageTitle: "Add Product", ///pug
      path: "/admin/add-product",
      editing: false,
      hasErrors: true,
      errorMessage: errors.array()[0].msg,
      oldInput:{title: title, description: description,price:price, image:image, description: description},
      validationErrors: errors.array()
    });
  }
  const imageURL = image.path
  const product = new Product({
    title: title,
    description: description,
    price: price,
    image: imageURL,
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
      //   oldInput:{title: title, description: description,price:price, image:image, description: description},
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
  const image = req.file;
  const description = req.body.description;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product", ///pug
      path: "/admin/edit-product",
      editing: true,
      errorMessage: errors.array()[0].msg,
      product:{title: title, description: description,price:price, _id:prodId},
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
      if(image){
        fileHelper.deleteFile(product.image)
        product.image = image.path;
      }
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
  const prodId = req.params.productId;
  Product.findById(prodId).then((product) => {
    if(!product){
      return next(new Error("Product not found"))
    }
    fileHelper.deleteFile(product.image)
    return Product.deleteOne({_id:prodId, userId:req.user._id})
    .then((result) => {
      console.log('Product Delete Success');
      // res.redirect("/admin/products");
      res.status(200).json({ message: "Success!" })

      })
    })
    .catch((err) => {
      res.status(500).json({message:"Delete Product failed"})
      // const error = new Error(err)
      // error.httpStatusCode = 500
      // throw next(error)
  })
  
};

exports.getAdminProduct = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  if(req.user){
    const page = +req.query.page || 1;
  let totalItems = 0
  Product.find({userId:req.user._id}).countDocuments().then(numberOfProducts =>{
    totalItems = numberOfProducts
    return Product.find()
    .skip((page-1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  }).then((products) => {
      res.render("admin/product", {
        products: products,
        pageTitle: "Admin Products", ///pug
        path: "/admin/products" ,//pug,
        errorMessage: message,
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page+1,
        previousPage: page-1,
        lastPage: Math.ceil(totalItems/ITEMS_PER_PAGE)
      });
    })
    .catch((err) => {
      const error = new Error(err)
      error.httpStatusCode = 500
      throw next(error)
    });
    
    // Product.find({userId:req.user._id})
    // .then((products) => {
    //   res.render("admin/product", {
    //     pageTitle: "Admin Products",
    //     path: "/admin/products", // pug
    //     products: products,
    //     errorMessage: message
        
    //   });
    // })
    // .catch((err) => {
    //   const error = new Error(err)
    //   error.httpStatusCode = 500
    //   throw next(error)
    // });

  }
  
};
