const express = require('express');
const {check , body} = require("express-validator")
const User = require('../models/user')
const isAuth = require('../middleware/isauth')
const router = express.Router()
const authController = require('../controllers/auth')

router.put('/signup',[
    body('email')
    .isEmail()
    .withMessage('Please enter a valid email')
    .custom((value, {req})=>{
        return User.findOne({email: value}).then(userDoc=>{
            if(userDoc){
                return Promise.reject('E-mail already exists')
            }
        })
    }).normalizeEmail(),
    body('password').trim().isLength({min:5}),
    body('name').trim().not().isEmpty()

],authController.signUp)

router.post('/login', authController.login)
router.get('/status', isAuth, authController.getUserStatus);

router.patch(
  '/status',
  isAuth,
  [
    body('status')
      .trim()
      .not()
      .isEmpty()
  ],
  authController.updateUserStatus
);


module.exports = router