const Product = require('../models/product')


exports.getAddProduct=(req, res, next) => {
    res.render("admin/add-product", {
      pageTitle: "Add Product", 
      path: "/admin/add-product", // pug
      editing: false
    });
}

exports.postAddProduct= (req, res, next) => {
  const title = req.body.title
  const imageUrl = req.body.imageUrl
  const price = req.body.price
  const description = req.body.description
  const product = new Product(title, price, description,imageUrl, null,req.user._id)
  product.save().then(result=>{
    console.log("Created Product");
    res.redirect('/admin/products')

  }).catch(err => {
    console.log(err);
  })
  }

  exports.getEditProduct=(req, res, next) => {
    const editmode = req.query.edit;
    console.log(editmode)
    if(!editmode)
    {
      return res.redirect("/")
    } 
    const productId = req.params.productId
    Product.findById(productId).then(product=>{
      res.render("admin/edit-product", {
            pageTitle: "Edit Product", 
            path: "/admin/edit-product", // pug
            editing: editmode,
            product: product
            
          });

    }).catch(err => {
      console.log(err);
    })
    // req.user.getProducts({where:{id:productId}}).then((product) => {
    //   if (!product){
    //     return res.redirect('/')
    //   }
    //   res.render("admin/edit-product", {
    //     pageTitle: "Edit Product", 
    //     path: "/admin/edit-product", // pug
    //     editing: editmode,
    //     product: product[0]
        
    //   });
    // }).catch(err => {
    //   console.log(err);
    // })
    
}
exports.postEditProduct=(req, res, next) => {
const prodId = req.body.productId
const title = req.body.title
const price = req.body.price
const imageUrl = req.body.imageUrl
const description = req.body.description
const product = new Product(title,price,description,imageUrl,prodId)
product.save()
.then(result=>{
  console.log("Updated product");
  res.redirect("/admin/products")
}).catch(err=>{
  console.log(err);
})
}

exports.deleteProduct=(req, res, next) => {
  const prodId = req.body.productId
  Product.deleteById(prodId).then(result=>{
    console.log("Product deleted");
    res.redirect("/admin/products")
  })
  .catch(err => {
    console.log(err);
  })
  }
  
  exports.getAdminProduct=(req, res, next) => {
    Product.fetchAll()
    .then((products) => {
      res.render("admin/product", {
            pageTitle: "Admin Products", 
            path: "/admin/products", // pug
            products: products
          });
    })
    .catch((err) => {
      console.log(err);
    })  
  }