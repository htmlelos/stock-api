'use strict';
const supplier = require('../controllers/supplier')
const router = require('express').Router()

//GET /suppliers - Obtener todos los proveedores
router.route('/suppliers')
  .get(supplier.getAllSupliers)

//POST /supplier - Crear un nuevo proveedor
router.route('/supplier')
  .post(supplier.createSupplier)

//GET /supplier - Obtener un proveedor por su id
router.route('/supplier/:supplierId')
  .get(supplier.getSupplier)
  .put(supplier.updateSupplier)

module.exports = router
