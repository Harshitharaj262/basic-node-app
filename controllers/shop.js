const Product = require("../models/product");
const User = require("../models/user");
const Order = require("../models/order");
const fs = require("fs");
const path = require('path')
const stripe = require('stripe')('sk_test_51PVrFA2KVDWXGD5V9Eg3dfrm9JzHY1eMRELZMdvqxyDgKNpZ8jVpriLeVdkwvFsGnJRKt4yWa3yQGCIZ70eM1d8j00ZUD5Wzh8')
const PDFDocument = require('pdfkit')

const ITEMS_PER_PAGE = 2

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems = 0
  Product.find().countDocuments().then(numberOfProducts =>{
    totalItems = numberOfProducts
    return Product.find()
    .skip((page-1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  }).then((products) => {
      res.render("shop/product-list", {
        products: products,
        pageTitle: "Products", ///pug
        path: "/products" ,//pug,
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
      const error = new Error(err)
      error.httpStatusCode = 500
      throw next(error)
    });
};

exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems = 0
  Product.find().countDocuments().then(numberOfProducts =>{
    totalItems = numberOfProducts
    return Product.find()
    .skip((page-1) * ITEMS_PER_PAGE)
    .limit(ITEMS_PER_PAGE)
  }).then((products) => {
      res.render("shop/index", {
        products: products,
        pageTitle: "Shop", ///pug
        path: "/" ,//pug,
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
        const error = new Error(err)
        error.httpStatusCode = 500
        throw next(error)
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
    const error = new Error(err)
      error.httpStatusCode = 500
      throw next(error)
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
      const error = new Error(err)
      error.httpStatusCode = 500
      throw next(error)
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
    const error = new Error(err)
      error.httpStatusCode = 500
      throw next(error)
  })
  
};

exports.getCheckout = (req, res, next) => {
  let products
  let total=0
  if (req.user){
    console.log(req.user);
    if(req.user.cart.items.length > 0){
      req.user
      .populate('cart.items.productId')
      .then((user) => {
        products = user.cart.items
        products.forEach((product) =>{
          total+=product.quantity * product.productId.price
        })
        return stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: products.map(p=>{
            return {
              quantity: p.quantity,
              price_data: {
                currency: 'usd',
                unit_amount: p.productId.price * 100,
                product_data: {
                  name: p.productId.title,
                  description: p.productId.description,
                },
              },
            }
          }),
          mode:'payment',
          success_url: req.protocol+ '://'+ req.get('host')+'/checkout/success',
          cancel_url:req.protocol+ '://'+ req.get('host')+'/checkout/cancel'
        })
      }).then(session=>{
        return res.render("shop/checkout", {
          products: products,
          pageTitle: "Checkout", ///pug
          path: "/checkout",
          totalSum: total,
          sessionId: session.id
        });
      })
      .catch((err) => {
        const error = new Error(err)
        error.httpStatusCode = 500
        throw next(error)
      });
    }
  }
  
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
    const error = new Error(err)
    error.httpStatusCode = 500
    throw next(error)
    });
};


exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId).then(order =>{
    if (!order){
      return next(new Error('No order found'))
    }
    if(order.user.userId.toString() !== req.user._id.toString()){
      return next(new Error(' Unauthorized'))
    }
    const invoiceFilename = 'invoice-'+orderId+'.pdf'
    const invoicePath = path.join('data','invoices',invoiceFilename)

  // fs.readFile(invoicePath, (err,data)=>{
  //   if(err){
  //     return next(err)
  //   }else{
  //     res.setHeader('Content-Type', 'application/pdf')
  //     res.setHeader('Content-Disposition', 'inline: filename:"'+invoiceFilename+'"')
  //     res.send(data)
  //   }
  // })
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'inline: filename="'+invoiceFilename+'"')
  const pdfDoc = new PDFDocument()
  pdfDoc.pipe(fs.createWriteStream(invoicePath))
  pdfDoc.pipe(res)

  pdfDoc.fontSize(26).text('Invoice',{
    underlined: true,
  })
  pdfDoc.text("------------------------------------------")
  let totalPrice =0
  order.products.forEach(product => {
    totalPrice+= product.quantity * product.product.price
    pdfDoc.fontSize(14).text(`${product.product.title} - ${product.quantity}  x $${product.product.price}`)

  })
  pdfDoc.fontSize(26).text("------------------------------------------")
  pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`)
  pdfDoc.end()
  }).catch((err) =>{
    next(err)
  })
  

}