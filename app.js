const express = require("express");
const bodyParser = require("body-parser");
const adminRoutes = require("./routes/admin");
const shopRoute = require("./routes/shop");
const path = require("path");
const errorController = require("./controllers/error")

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

app.use(shopRoute);
app.use("/admin", adminRoutes);

app.use(errorController.get404);

app.listen(3000);
