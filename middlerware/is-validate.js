const {check , body} = require("express-validator")
const User = require("../models/user")

exports.checkLoginValue = (req, res, next) =>{
    const values = [check("email").isEmail().withMessage("Please enter a valid email").normalizeEmail(),body(
        "password",
        "Please enter a password with only numbers and text an atleast 5 characters"
      )
        .isLength({ min: 5 })
        .isAlphanumeric().trim()]
    return values 

}

exports.checkSignUpValue = (req, res, next) =>{
    const values = [
        check("email")
          .isEmail()
          .withMessage("Please enter a valid email")
          .custom((value, { req }) => {
            // if (value === "test@test.com") {
            //   throw new Error("This email address is forbidden");
            // }
            // return true;
            return User.findOne({ email: value }).then((userDoc) => {
              if (userDoc) {
                return Promise.reject("Email already exists");
              }
            });
          }).normalizeEmail(),
        body(
          "password",
          "Please enter a password with only numbers and text an atleast 5 characters"
        )
          .isLength({ min: 5 })
          .isAlphanumeric().trim(),
    
        body("confirmPassword").trim().custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error("Passwords do not match");
          }
          return true;
        }),
      ]
    return values 

}

exports.checkAddProduct =  (req, res, next)=>{
  const values=[
   body('title', "Title should only contain numbers and characters.").isString().isLength({min:3}).trim(),
   body('price', "Invalid price value").isFloat(),
   body('description' , "Description must contain a minimum of 3 and a maximum of 200 characters.").isLength({min:5, max: 200})
  ]
  return values
}

