'use strict';

const brand = require('../controllers/brand')
const router = require('express').Router()

// GET /brands - obtener todas las marcas
router.route('/brands')
  .get(brand.getAllBrands)

// POST /brand - crear una nueva marca
router.route('/brand')
  .post(brand.createBrand)

// GET /brand - obtener una marca por su id
router.route('/brand/:brandId')
  .get(brand.getBrand)
  .put(brand.updateBrand)

module.exports = router
