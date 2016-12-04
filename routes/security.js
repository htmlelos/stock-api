'use strict';
const security = require('../controllers/security')
const router = require('express').Router()

router.use(security.authenticate)

module.exports = router
