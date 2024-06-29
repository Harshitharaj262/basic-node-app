const express = require('express')
const router = express.Router()

const feedController = require('../controllers/feed')

router.get('/posts', feedController.getFeeds)

router.post('/posts', feedController.postFeeds)

module.exports = router