'use strict';
const security = require('../controllers/security')
const user = require('../controllers/user')
const router = require('express').Router()

router.use(security.authenticate)

router.route('/currentUser')
    .get(user.getCurrentUser)

module.exports = router
