const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const sendgridTransport = require('nodemailer-sendgrid-transport')
const User = require("../models/user");

// const transporter = nodemailer.createTransport(sendgridTransport({
//   auth:{
//     api_key:API_KEY
//   }
// }))

exports.getLogin = (req, res, next) => {
  let message = req.flash('error')
  if(message.length > 0) {
    message = message[0]
  }else{
    message = null
  }
  res.render("auth/login", {
    pageTitle: "Login", ///pug
    path: "/login",
    errorMessage: message
  });
  
};
exports.postLogin = (req, res, next) => {
  const email = req.body.email
  const password = req.body.password
  User.findOne({ email: email}).then(userDoc => {
    if(!userDoc){
      req.flash('error', 'Invalid email or password')
      return res.redirect('/login')
    }
    return bcrypt.compare(password,userDoc.password).then(doMatch=>{
      if (doMatch) {
        req.session.isLoggedIn = true;
        req.session.user = userDoc
        return req.session.save((err) => {
          console.log(err);
          res.redirect("/");
        });
      }
      req.flash('error', 'Invalid email or password')
      res.redirect('/login')

    }).catch(err => {
      console.log(err);
      req.flash('error', 'Invalid email or password')
      res.redirect('/login')
    })

  }).catch(err => {
    console.log(err);
  })

};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/login");
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error')
  if(message.length > 0) {
    message = message[0]
  }else{
    message = null
  }
  res.render("auth/signup", {
    pageTitle: "Signup", ///pug
    path: "/signup",
    errorMessage: message
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({email: email}).then((userDoc) => {
    if(userDoc){
      req.flash('error', 'Email already exists');
      return res.redirect('/signup')
    }
    return bcrypt.hash(password,12).then((hashedPassword)=>{
      const user = new User({
        email: email,
        password: hashedPassword,
        cart: {items:[]}
      })
      return user.save()
    })
    .then(()=>{
      res.redirect('/login')
      // return transporter.sendMail({
      //   to: email,
      //   from: 'shop@nodecomplete.com',
      //   subject:'Signup successful',
      //   html:'<h1>Signup successful</h1>'
      // })
    })
    // .catch((err)=>{
    //   console.log(err);
    // })
  })
  .catch((err) => {
    console.log(err);
  })
  
};