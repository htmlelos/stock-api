'use strict';

const brand = require('../controllers/brand')
const router = require('express').Router()

// GET /brands - obtener todas las marcas
router.route('/brands')
  .get(brand.getAllBrands)

// POST /brand - crear una nueva marca
router.route('/brand')
  .post(brand.createBrand)

module.exports = router
