const User = require('../models/user')
const { check, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


exports.signUp = async (req, res, next) => {
    try {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            const error = new Error('Validation failed')
            error.statusCode = 422
            error.data = errors.array()
            throw error
        }
        const email = req.body.email
        const password = req.body.password
        const name = req.body.name
    
       const hashedPwd = await bcrypt.hash(password, 12)
       const user = new User({
                email: email,
                password: hashedPwd,
                name: name
        })
        const result = await user.save()
        res.status(201).json({message:'User created!', userId:result._id})
    } catch (error) {
        if(!error.statusCode){
            error.statusCode = 500
        }
        next(error)
    }
  
    
}

exports.login= async (req, res, next) => {
    try{
    const email = req.body.email
    const password = req.body.password
    let loadedUser
    const user = await User.findOne({email:email})
        if(!user){
            const error = new Error('User with this email could not be found')
            error.statusCode = 401
            throw error
        }
        loadedUser=user
       const isEqual = await bcrypt.compare(password, user.password)
        if(!isEqual){
            const error = new Error('Password is incorrect')
            error.statusCode = 401
            throw error
        }
        const token = jwt.sign({
            email:loadedUser.email,
            userId:loadedUser._id.toString()
        }, 'thisisadummysecret',{expiresIn:'1h'})
        res.status(200).json({token:token, userId:loadedUser._id.toString()})
     } catch(error){
    if(!error.statusCode){
        error.statusCode = 500
    }
    
    next(error)
   }
}