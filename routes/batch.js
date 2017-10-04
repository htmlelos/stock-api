'use strict'

const batch = require('../controllers/batch')
const router = require('express').Router()

router.route('/batchs')
    .get(batch.getAllBatchs)
    .post(batch.retrieveAllBatchs)

module.exports = router    