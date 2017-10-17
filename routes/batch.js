'use strict'

const batch = require('../controllers/batch')
const router = require('express').Router()

router.route('/batchs')
    .get(batch.getAllBatchs)
    .post(batch.retrieveAllBatchs)

router.route('/batch')
    .post(batch.createBatch)

router.route('/batch/:batchId')
    .get(batch.getBatch)    
    .put(batch.updateBatch)
    .delete(batch.deleteBatch)

module.exports = router    