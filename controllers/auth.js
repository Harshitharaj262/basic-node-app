const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const User = require("../models/user");

// const transporter = nodemailer.createTransport(sendgridTransport({
//   auth:{
//     api_key:API_KEY
//   }
// }))

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    pageTitle: "Login", ///pug
    path: "/login",
    errorMessage: message,
  });
};
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (!userDoc) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }
      return bcrypt
        .compare(password, userDoc.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = userDoc;
            return req.session.save((err) => {
              console.log(err);
              res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          req.flash("error", "Invalid email or password");
          res.redirect("/login");
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/login");
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    pageTitle: "Signup", ///pug
    path: "/signup",
    errorMessage: message,
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "Email already exists");
        return res.redirect("/signup");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const user = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });
          return user.save();
        })
        .then(() => {
          res.redirect("/login");
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    pageTitle: "Reset Password", ///pug
    path: "/reset",
    errorMessage: message,
  });
};

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No account with that email.");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        return user.save();
      })
      .then((result) => {
        //using a  nodemailer
        // res.redirect("/login");
        //  transporter.sendMail({
        //   to: req.body.email,
        //   from: 'shop@nodecomplete.com',
        //   subject:'Password Reset',
        //   html:`<p>You requested a password reset</p> <p>Click this <a href="http://localhost:3000/reset/${token}">link </a>to set a new password</p>`
        // })
        res.render("auth/mail-template", {
          pageTitle: "Reset Password", ///pug
          path: "/mail-template",
          token:token
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({resetToken: token, resetTokenExpiration:{$gt: Date.now()}}).then(user=>{
    let message = req.flash("error");
    if (message.length > 0) {
      message = message[0];
    } else {
      message = null;
    }
    res.render("auth/new-password", {
      pageTitle: "New Password", ///pug
      path: "/new-password",
      errorMessage: message,
      userId: user._id.toString(),
      token: token
    });
  }).catch((err) => {
    console.log(err);
  })
 
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const token = req.body.token
  let resetUser;
  User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}, _id: userId}).then(user=>{
    resetUser = user
    return bcrypt.hash(newPassword,12)
  }).then(hashedPassword=>{
    resetUser.password = hashedPassword
    resetUser.resetToken=undefined
    resetUser.resetTokenExpiration=undefined
    return resetUser.save()
  }).then(result=>{
    res.redirect('/login')
  })
  .catch(err=>{
    console.log(err);
  })

};
