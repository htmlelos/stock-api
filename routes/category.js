'use strict';
const category = require('../controllers/category')
const router = require('express').Router()

// GET /categories - obtener todas las categorias
router.route('/categories')
  .get(category.getAllCategories)
//POST /category - Crea una nueva categoria
router.route('/category')
  .post(category.createCategory)
  
router.route('/role/:roleId')
  .get(category.getCategory)
  .put(category.updateCategory)
  .delete(category.deleteCategory)

module.exports = router