"use strict";
const common = require('../controllers/common')
const security = require('../controllers/security')
const router = require('express').Router()

router.route('/ping')
	.get(common.ping)

router.route('/login')
  .post(security.login)

router.route('/logout')  
  .get(security.logout)

module.exports = router
