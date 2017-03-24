'use strict';
const category = require('../controllers/category')
const router = require('express').Router()

// GET /categories - obtener todas las categorías
router.route('/categories')
  .get(category.getAllCategories)
//POST /category - Crea una nueva categoría
router.route('/category')
  .post(category.createCategory)
  
router.route('/category/:categoryId')
  .get(category.getCategory)
  .put(category.updateCategory)
  .delete(category.deleteCategory)

router.route('/category/:categoryId/categories')
  .get(category.getCategories)

module.exports = router