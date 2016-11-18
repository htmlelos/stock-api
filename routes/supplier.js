'use strict';
const supplier = require('../controllers/supplier')
const router = require('express').Router()

//GET /suppliers - Obtener todos los proveedores
router.route('/suppliers')
  .get(supplier.getAllSupliers)

module.exports = router
