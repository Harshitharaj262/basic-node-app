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

    const product = new Product(null,title, imageUrl, price, description);
    product.save().then(() => {
      res.redirect("/products");
    }
    ).catch((err) => {console.log(err);})
   
  }

  exports.getEditProduct=(req, res, next) => {
    const editmode = req.query.edit;
    console.log(editmode)
    if(!editmode)
    {
      return res.redirect("/")
    } 
    const productId = req.params.productId

    Product.findById(productId, product =>{
      if(!product){
        return res.redirect("/")
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product", 
        path: "/admin/edit-product", // pug
        editing: editmode,
        product: product
        
      });
    })
    
}
exports.postEditProduct=(req, res, next) => {
const prodId = req.body.productId
const title = req.body.title
const price = req.body.price
const imageUrl = req.body.imageUrl
const description = req.body.description
const updatedProducts = new Product(prodId, title,imageUrl,price,description)
updatedProducts.save()

res.redirect("/admin/products")
  
}

exports.deleteProduct=(req, res, next) => {
  const prodId = req.body.productId
  Product.deleteById(prodId)
  res.redirect("/admin/products")
    
  }
  
  exports.getAdminProduct=(req, res, next) => {
    Product.fetchAll((proucts)=>{
      res.render("admin/product", {
        pageTitle: "Admin Products", 
        path: "/admin/products", // pug
        products: proucts
      });
  
    })
    
  }