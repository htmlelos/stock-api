'use strict';

const business = require('../controllers/business')
const router = require('express').Router()

router.route('/businesses')
    .get(user.getAllBusineses)
    .post(user.retrieveAllBusinesses)

module.exports = router