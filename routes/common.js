"use strict";
const common = require('../controllers/common')
const router = require('express').Router()

router.route('/ping')
	.get(common.ping)

module.exports = router
