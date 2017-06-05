'use strict';
const demand = require('../controllers/demand')
const router = require('express').Router()

//GET /demands - Obtener todas las solicituds
router.route('/demands')
	.get(demand.getAllDemands)
	.post(demand.retrieveAllDemands)

router.route('/demand')
	.post(demand.createDemand)

module.exports = router