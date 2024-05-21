const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session")
const MongodbStore = require("connect-mongodb-session")(session)
const path = require("path");
const adminRoutes = require("./routes/admin");
const shopRoute = require("./routes/shop");
const User = require("./models/user");
const authRoute = require("./routes/auth");
const errorController = require("./controllers/error");

const app = express();

const MONGODB_URI ='mongodb+srv://admin:admin1234@node-app.ofw4lzs.mongodb.net/?retryWrites=true&w=majority&appName=node-app'

const store = new MongodbStore({
  uri: MONGODB_URI,
  collection:'sessions'

})
app.set("view engine", "ejs"); // Use this engine for dynamic views and use ejs

app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({secret:'my secret', resave: false, saveUninitialized: false, store: store}))
app.use((req, res, next) =>{
  if(!req.session.user){
   return  next()
  }else{
    User.findById(req.session.user._id)
    .then((user) => {
     req.user=user
     next()
    })
    .catch((error) => {
      console.log(error);
    });
  }
  
})


app.use(express.static(path.join(__dirname, "public")));

app.use(shopRoute);
app.use("/admin", adminRoutes);
app.use(authRoute)

app.use(errorController.get404);

mongoose.connect(MONGODB_URI)
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


