'use strict';
const counter = require('../controllers/counter')
const router = require('express').Router()
// GET /counters - obtiene todos los contadores
router.route('/counters')
    .get(counter.getAllCounters)
    .post(counter.retrieveAllCounters)
// POST /counter - crea un nuevo contador
router.route('/counter')
    .post(counter.createCounter)
// obtener un contador por su counterId
// actulizar un contador por su counterId
// elimiar un contador por su counterId
router.route('/counter/:counterId')
    .get(counter.getCounter)
    .put(counter.updateCounter)
    .delete(counter.deleteCounter)

router.route('/counter/:counterId/next')
    .get(counter.incrementCounter)

router.route('/counter/:counterId/current')
    .get(counter.currentCounter)

router.route('/counter/:counterId/reset')
    .get(counter.resetCounter)

module.exports = router