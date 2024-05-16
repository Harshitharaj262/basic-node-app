const express = require("express");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoute = require("./routes/shop");
const path = require("path");
const errorController = require("./controllers/error");
const db = require("./utils/db").mongoconnect;
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs"); // Use this engine for dynamic views and use ejs

app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  User.findById("6644dc4a43cac0ba265d5951")
    .then((user) => {
      
      
      req.user = new User(user.username,user.email,user.cart, user._id);
      next();
    })
    .catch((error) => {
      console.log(error);
    });
});
app.use(shopRoute);
app.use("/admin", adminRoutes);

app.use(errorController.get404);

db(() => {
  app.listen(3000);
});
