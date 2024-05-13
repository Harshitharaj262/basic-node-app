const Product = require("../models/product");
const Cart = require("../models/cart");
exports.getProducts = (req, res, next) => {
  Product.fetchAll().then(([rows, fieldData])=>{
    res.render("shop/product-list", {
      products: rows,
      pageTitle: "Products", ///pug
      path: "/products", //pug
    });

  }).catch(err =>{
    console.log(err);
  });
};

exports.getProduct = (req, res, next) => {
  const productId = req.params.productId;
  Product.findById(productId).then(([product]) =>{
    res.render("shop/product-detail", {
      product: product[0],
      pageTitle: "Product details", ///pug
      path: "/products", //pug
    });

  }).catch(err =>{
    console.log(err);
  })
};

exports.getIndex = (req, res, next) => {
  Product.fetchAll().then(([rows, fieldData])=>{
    res.render("shop/index", {
      products: rows,
      pageTitle: "Shop", ///pug
      path: "/", //pug
    });

  }).catch(err =>{
    console.log(err);
  });
};

exports.getCart = (req, res, next) => {
  Cart.getCart(cart=>{
    Product.fetchAll(products =>{
      const cartProducts = [];
      for(items of products){
        const cartProductData =  cart.products.find(prod => prod.id === items.id);
        if(cartProductData){
          cartProducts.push({
            productData: items,
            qty: cartProductData.qty
          })
        }
      }
      res.render("shop/cart", {
        products: cartProducts,
        pageTitle: "Your Cart", ///pug
        path: "/cart", //pug
      })
      
    })
  })
 
};

exports.postCardDeleteProduct = (req, res, next) => {
  const prodId = req.body.prodId
  Product.findById(prodId, product => {
    Cart.deleteProduct(prodId, product.price);
    res.redirect('/cart')

  })
  
}

exports.addToCart = (req, res, next) => {
  const productId= req.body.productId;
  Product.findById(productId,(product)=>{
    Cart.addProduct(productId,product.price)
  })
  console.log(productId);
  // Product.fetchAll((products) => {
  //   res.render("shop/cart", {
  //     products: products,
  //     pageTitle: "Your Cart", ///pug
  //     path: "/cart", //pug
  //   });
  // });
  res.redirect("/cart")
};

exports.getOrders = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render("shop/orders", {
      products: products,
      pageTitle: "Orders", ///pug
      path: "/orders", //pug
    });
  });
};
exports.getCheckout = (req, res, next) => {
  res.render("shop/checkout", {
    products: products,
    pageTitle: "Checkout", ///pug
    path: "/checkout", //pug
  });
};
