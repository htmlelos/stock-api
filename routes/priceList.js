'use strict';
const priceList = require('../controllers/priceList')
const router = require('express').Router()

//GET /pricelists - obtenner todas las listas de precio
router.route('/pricelists')
  .get(priceList.getAllPriceLists)
// POST /pricelist - crear una nueva lista de precio
router.route('/pricelist')
  .post(priceList.createPriceList)
//GET /pricelist - Obtener una lista de precios por su id
router.route('/pricelist/:pricelistId')
  .get(priceList.getPriceList)
  .put(priceList.updatePriceList)

module.exports = router