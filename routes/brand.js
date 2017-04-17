'use strict';

const brand = require('../controllers/brand')
const router = require('express').Router()

// POST /brands - obtener todas las marcas
router.route('/brands')
  .post(brand.getAllBrands)
// POST /brand - crear una nueva marca
router.route('/brand')
  .post(brand.createBrand)
// GET /brand - obtener una marca por su id
router.route('/brand/:brandId')
  .get(brand.getBrand)
  .put(brand.updateBrand)
  .delete(brand.deleteBrand)
// POST /brand/:brandId/supplier
router.route('/brand/:brandId/supplier')
  .post(brand.addSupplier)
// GET /brand/:brandId/suppliers
router.route('/brand/:brandId/suppliers')
  .get(brand.getAllSuppliers)
  .delete(brand.deleteSuppliers)

module.exports = router