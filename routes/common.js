"use strict";
const common = require('../controllers/common')
const security = require('../controllers/security')
const router = require('express').Router()

router.route('/ping')
	.get(common.ping)

router.route('/login')
	.get(security.login)

module.exports = router
