const express = require('express')
const {check , body} = require("express-validator")
const router = express.Router()

const feedController = require('../controllers/feed')
const isAuth = require('../middleware/isauth')

router.get('/posts',isAuth, feedController.getFeeds)

router.post('/posts',isAuth,[
    body('title').trim().isLength({min:5}),
    body('content').trim().isLength({min:5})

], feedController.postFeeds)

router.get('/post/:postId',isAuth, feedController.getFeed)

router.put('/post/:postId', isAuth,[
    body('title').trim().isLength({min:5}),
    body('content').trim().isLength({min:5})

],feedController.putFeed)

router.delete('/post/:postId',isAuth, feedController.deleteFeed)

module.exports = router