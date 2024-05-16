const Product = require("../models/product");
const User = require("../models/user");

exports.getProducts = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/product-list", {
        products: products,
        pageTitle: "Products", ///pug
        path: "/products", //pug
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: "Product details", ///pug
        path: "/products", //pug
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render("shop/index", {
        products: products,
        pageTitle: "Shop", ///pug
        path: "/", //pug
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((products) => {
      res.render("shop/cart", {
        products: products,
        pageTitle: "Your Cart", ///pug
        path: "/cart", //pug
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postCardDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.deleteCartItem(prodId).then(result=>{
    // console.log(result);
    res.redirect('/cart')
  }).catch(err=>{
    console.log(err);
  })
};

exports.addToCart = (req, res, next) => {
  const productId = req.body.productId;
  Product.findById(productId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log("Added to Cart");
      res.redirect("/cart");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getOrders = (req, res, next) => {
  req.user.getOrders().then(orders=>{
    res.render('shop/orders',{
      path:'/orders',
      pageTitle: "Orders",
      orders:orders
    })

  }).catch((err) => {
    console.log(err);

  })
  
};
exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    pageTitle: "Checkout", ///pug
    path: "/checkout", //pug
  });
};

exports.postOrder = (req, res, next) => {
  let fetchCart;
  req.user.addOrder()
    .then((data) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      console.log(err);
    });
};
