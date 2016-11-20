'use strict';
const security = require('../controllers/security')
const router = require('express').Router()

// router.route('/login')
// 	.post(security.login)

router.use(security.authenticate)

module.exports = router
