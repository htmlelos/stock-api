'use strict';
const demand = require('../controllers/demand')
const router = require('express').Router()

//GET /demands - Obtener todas las solicituds
router.route('/demands')
	.get(demand.getAllDemands)
	.post(demand.retrieveAllDemands)

router.route('/demand')
	.post(demand.createDemand)

router.route('/demand/:demandId')
	.get(demand.getDemand)
	.put(demand.updateDemand)
	.delete(demand.deleteDemand)

router.route('/demand/:demandId/add/item')
	.put(demand.addItem)
	
router.route('/demand/:demandId/delete/item')
	.put(demand.deleteItem)

router.route('/demand/:demandId/delete/items')
	.put(demand.deleteSelectedItems)

module.exports = router