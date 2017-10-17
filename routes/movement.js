'use strict';
const movement = require('../controllers/movement')
const router = require('express').Router()

router.route('/movements')
    .get(movement.getAllMovements)
    .post(movement.retrieveAllMovements)

router.route('/movement')
    .post(movement.createMovement)

router.route('/movement/:movementId')
    .get(movement.getMovement)
    .put(movement.updateMovement)

router.route('/movement/:movementId/batch/:batchId')
    .get(movement.addBatch)
    .delete(movement.deleteBatch)

module.exports = router  

