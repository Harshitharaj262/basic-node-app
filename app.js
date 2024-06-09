const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer")
const mongoose = require("mongoose");
const session = require("express-session")
const csrf = require("csurf")
const MongodbStore = require("connect-mongodb-session")(session)
const flash = require("connect-flash")
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
const csrfProtection = csrf() //middleware

const fileStorage = multer.diskStorage({
  destination: (req,file,cb)=>{
    cb(null,'images')},
  filename: (req,file,cb)=>{
    cb(null,new Date().toISOString()+'-'+file.originalname)
  }
})

const filefilter = (req,file,cb)=>{
  if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
    cb(null, true)
  }else{
    cb(null, false)
  }

  
}
app.set("view engine", "ejs"); // Use this engine for dynamic views and use ejs

app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));

app.use(multer({dest:'images', storage: fileStorage, fileFilter:filefilter}).single('image'))

app.use(express.static(path.join(__dirname, "public")));

app.use('/images', express.static(path.join(__dirname,"images")))

app.use(session({secret:'my secret', resave: false, saveUninitialized: false, store: store}))

app.use(csrfProtection)

app.use(flash())

app.use((req,res,next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn,
  res.locals.csrfToken= req.csrfToken()
  next()
})

app.use((req,res,next)=>{
  // throw new Error("Dummy")
  if(!req.session.user || !req.session.user._id){
    return next();
  }
  User.findById(req.session.user._id).then((user)=>{
    if(!user){
      return next();
    }
    req.user = user;
    next()
  }).catch((error)=>{
    next(new Error(error))
  });
})

app.use(shopRoute);
app.use("/admin", adminRoutes);
app.use(authRoute)


app.get('/500', errorController.get500)
app.use(errorController.get404);

app.use((error, req, res, next)=>{
  res.status(500).render('500',{
    pageTitle: 'Error',
    path:'/500',
    isAuthenticated: req.session.isLoggedIn
  })

})

mongoose.connect(MONGODB_URI)
.then(result=>{
  app.listen(3000);
}).catch(err=>{
  console.log(err);
})


