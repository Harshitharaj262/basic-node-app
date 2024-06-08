const express = require("express");
const validate = require("../middlerware/is-validate");

const router = express.Router();

const authController = require("../controllers/auth");

const User = require("../models/user");

router.get("/login", authController.getLogin);

router.post("/login", validate.checkLoginValue(), authController.postLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/signup", validate.checkSignUpValue(),authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getReset);

router.post("/reset", authController.postReset);

router.get("/reset/:token", authController.getNewPassword);

router.post("/new-password", authController.postNewPassword);

module.exports = router;
