const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");

exports.getProducts = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/product-list", {
        products: products,
        pageTitle: "Products", ///pug
        path: "/products"
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
        path: "/products"
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then((products) => {
      res.render("shop/index", {
        products: products,
        pageTitle: "Shop", ///pug
        path: "/" //pug
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  if (req.user){
    console.log(req.user);
    if(req.user.cart.items.length > 0){
      req.user
      .populate('cart.items.productId')
      .then((user) => {
        const products = user.cart.items
        res.render("shop/cart", {
          products: products,
          pageTitle: "Your Cart", ///pug
          path: "/cart"
        });
      })
      .catch((err) => {
        console.log(err);
      });
    }else{
      const products = req.user.cart.items
      res.render("shop/cart", {
        products: products,
        pageTitle: "Your Cart", ///pug
        path: "/cart"
      });
    }
  }
  
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
  Order.find({'user.userId':req.user._id}).then(orders=>{
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
    path: "/checkout"
  });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .then(user => {
      const products = user.cart.items.map(i=>{
        return {product:{...i.productId._doc}, quantity: i.quantity}
      })
      const order = new Order ({
        user:{
          email: req.user.email,
          userId:req.user
        },
        products:products
      })
      return order.save()

  }).then(result=>{
    return req.user.clearCart()
  }).then(result=>{
    res.redirect("/orders");
  }).catch((err) => {
      console.log(err);
    });
};
