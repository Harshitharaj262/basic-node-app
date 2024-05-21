const User = require('../models/user')
exports.getLogin = (req, res, next) => {
//  const isLoggedIn= req.get('Cookie').trim().split('=')[1];
//  console.log(isLoggedIn);
  res.render("auth/login", {
    pageTitle: "Login", ///pug
    path: "/login", //pug
    isAuthenticated: false,
  });
};
exports.postLogin = (req, res, next) => {
  // res.setHeader('Set-Cookie','loggedIn=true; HttpOnly')
  // const username = req.body.username
  // const password = req.body.password
  // const email = req.body.email
  User.findById("664729662eb77afe42391cbe")
  .then((user) => {
    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.save((err)=>{
      console.log(err);
      res.redirect("/");

    })
   
  })
  .catch((error) => {
    console.log(error);
  });
 
};

exports.postLogout = (req, res, next) => {
 req.session.destroy((err)=>{
  console.log(err);
    res.redirect('/')
 });
 
};
 