'use strict';
const product = require('../controllers/product')
const router = require('express').Router()

// GET /users - obtener todos los Products
router.route('/products')
    .get(product.getAllProducts)
    .post(product.retrieveAllProducts)
// POST /user - crear un nuevo producto
router.route('/product')
    .post(product.createProduct)
// GET /user/:userId - obtener un producto por su Id
router.route('/product/:productId')
    .get(product.getProduct)        
    .put(product.updateProduct)
    .delete(product.deleteProduct)

// GET /product/:productId/brand
router.route('/product/:productId/brand')
    .get(product.getBrand)
// GET /product/:productId/pricelists
router.route('/product/:productId/pricelists')
    .get(product.getAllPriceLists)
// POST /product/:productId/price
router.route('/product/:productId/pricelist')
    .post(product.addPriceList)
// POST /product/:productId/component
router.route('/product/:productId/component')
    .post(product.addComponent)
// GET  /product/:productId/components
// DELETE /product/:productId/components
router.route('/product/:productId/components')
    .get(product.getComponents)
    .delete(product.removeComponents)

module.exports = router