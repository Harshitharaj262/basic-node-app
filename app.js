const express = require("express");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoute = require("./routes/shop");
const path = require("path");
const errorController = require("./controllers/error");
const mongoose = require("mongoose");
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs"); // Use this engine for dynamic views and use ejs

app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  User.findById("664729662eb77afe42391cbe")
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((error) => {
      console.log(error);
    });
  // next()
});
app.use(shopRoute);
app.use("/admin", adminRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://admin:admin1234@node-app.ofw4lzs.mongodb.net/?retryWrites=true&w=majority&appName=node-app')
.then(result=>{
  User.findOne().then(user=>{
    if (!user){
      const user = new User({
        username: "Harshitha",
        email: "harshi@abc.com",
        cart:{
          items:[]
        }
    
      })
      user.save()
    }
  })
  
  app.listen(3000);
}).catch(err=>{
  console.log(err);
})


