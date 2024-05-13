const express = require("express");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoute = require("./routes/shop");
const path = require("path");
const errorController = require("./controllers/error")
const sequelize = require("./utils/db");
const Product = require("./models/product");
const User = require("./models/user");
const Cart = require("./models/cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");

const app = express();

// pug
// app.set('view engine', 'pug') // Use this engine for dynamic views and use pug here

//handlerbars
// const expressHbs = require("express-handlebars");
// app.engine(
//   "hbs",
//   expressHbs.engine({
//     layoutsDir: "views/layouts/",
//     defaultLayout: "main-layout.hbs",
//     extname: "hbs",
//   })
// );
// app.set("view engine", "hbs"); // Use this engine for dynamic views and use handlerbars here

// EJS
app.set('view engine', 'ejs'); // Use this engine for dynamic views and use ejs

app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
    User.findByPk(1).then((user) => {
        req.user = user;
        next();
    }).catch((error) =>{
        console.log(error);
    })
})
app.use(shopRoute);
app.use("/admin", adminRoutes);

app.use(errorController.get404);

Product.belongsTo(User,{constraints: true, onDelete:'CASCADE'}) //user create this product
User.hasMany(Product) // user can have many products
User.hasOne(Cart) //user has one cart
Cart.belongsTo(User)// cart belong to one user
Cart.belongsToMany(Product, {through: CartItem}) // cart belongs to many products and tells this should be stored in CartItem
Product.belongsToMany(Cart, {through: CartItem}) // one product can be in multiple carts
Order.belongsTo(User) //one order belongs to one user
User.hasMany(Order) // user has many orders
Order.belongsToMany(Product,{through: OrderItem})
// creates table in mysql db
sequelize.sync().then(result=>{
    // console.log(result);
    return User.findByPk(1)
    
}).then(result =>{
    if(!result){
        return User.create({name:'Max',email:'test@test.com'})
    }
    return result;
}).then(user =>{
    // console.log(user);
    return user.createCart();
   
}).then(data=>{
    // console.log(data);
    app.listen(3000);
})
.catch(err=>{
    console.log(err);
})




