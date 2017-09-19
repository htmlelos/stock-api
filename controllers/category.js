'use strict';
const mongoose = require('mongoose')
const Category = require('../models/category')
const message = require('../services/response/message')

function getAllCategories(request, response) {
  Category.find({})
    .then(categories => {
      return Promise.all(categories.map(category => {
        return Category.populate(category, { path: 'categories' })
      }))
    })
    .then(categories => {
      message.success(response, 200, '', categories)
    })
    .catch(error => {
      message.failure(response, 422, '', error)
    })
}
function retrieveAllCategories(request, response) {
  let limit = parseInt(request.body.limit)
  let fields = request.body.fields
  let filter = request.body.filter
  let sort = request.body.sort

  Category.find(filter)
    .select(fields)
    .limit(limit)
    .sort(sort)
    .then(categories => {
      return Promise.all(categories.map(category => {
        return Category.populate(category, { path: 'categories' })
      }))
    })
    .then(categories => {
      message.success(response, 200, '', categories)
    })
    .catch(error => {
      message.failure(response, 404, 'No se pudieron recuperar las categorias', error)
    })
}

function checkCategory(request) {
  request.checkBody('name', 'Debe proporcionar un nombre de categoría')
    .notEmpty()
  request.checkBody('description', 'Debe proporcionar una descripción de la categoría')
    .notEmpty()
  request.checkBody('status', 'Debe definir el estado de la categoria')
    .notEmpty()
  request.checkBody('status', 'El estado de la categoria solo puede ser ACTIVO o INACTIVO')
    .isIn('ACTIVO', 'INACTIVO')
  request.checkBody('business', 'Debe indicar la empresa a la que pertenece la categoria')
    .notEmpty()
}

// Crea una nueva Categooria
function createCategory(request, response) {
  checkCategory(request)
  // Crea una nueva instanscia de Category con los parametros recibidos

   request.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) {
                let messages = result.useFirstErrorOnly().array().map(x => x.msg).join(',')
                return Promise.reject({ code: 422, message: messages, data: null })
            }
            return Promise.resolve()
        })
      .then(() => {
        let newCategory = new Category(request.body)
        newCategory.createdBy = request.decoded.username
        return newCategory.save()
      })  
      .then(category => {
        message.success(response, 200, 'categoría creada con éxito', { id: category._id })
      })
      .catch(error => {
        if (error.code && error.code === 11000) {
          let error = {code: 422, message:'El rol ya existe' , data: null}          
          message.failure(response, error.code, error.message, error.data)
        } else if (error.code) {
          message.failure(response, error.code, error.message, error.data)
        } else {
          message.failute(response, 500, 'No se pudo crear la categoria', null)
        }
    })
}
// Obtener una category
function findCategory(categoryId) {
  return Category.findById({ _id: categoryId })
}
// Obtener un rol por su categoryId
function getCategory(request, response) {
  findCategory(request.params.categoryId)
    .then(category => {
      if (category) {
        return Category.populate(category, { path: 'categories' })
      } else {
        let error = { code: 404, message: 'No se encontró la categoría', data: null }
        return Promise.reject(error)
      }
    })
    .then(category => {
      message.success(response, 200, 'categoría obtenida con éxito', category)
    })
    .catch(error => {
      message.failure(response, error.code, error.message, error.data)
    })
}

function updateCategory(request, response) {
  findCategory(request.params.categoryId)
    .then(category => {
      if (category) {
        let newCategory = request.body
        newCategory.updatedBy = request.decoded.username
        newCategory.updatedAt = Date()
        return Category.update({ _id: request.params.categoryId }, { $set: newCategory }, { runValidators: true })
      } else {
        return Promise.reject({ code: 404, message: 'No se encontró la categoría', data: null })
      }
    })
    .then(() => {
      return findCategory(request.params.categoryId)
    })
    .then(category => {
      message.success(response, 200, 'categoría actualizada con éxito', { id: category._id })
    })
    .catch(error => {
      if (error.code === 11000) {
        message.failure(response, 422, 'La categoría ya existe', null)
      } else {
        message.failure(response, error.code, error.message, error.data)
      }
    })
}

function deleteCategory(request, response) {
  findCategory(request.params.categoryId)
    .then(category => {
      if (category) {
        Category.remove({ _id: category.id })
          .then(category => {
            message.success(response, 200, 'categoría eliminada con éxito', null)
          })
          .catch(error => {
            message.failure(response, 422, 'No se pudo eliminar la categoría', error)
          })
      } else {
        message.failure(response, 404, 'La categoría no es válida', null)
      }
    })
    .catch(error => {
      message.failure(response, 422, 'No se pudo recuperar ', error)
    })
}

function getCategories(request, response) {
  findCategory(request.params.categoryId)
    .then(category => {
      if (category) {
        message.success(response, 200, 'Sub categorías obtenidas con éxito', category.categories)
      } else {
        let error = {
          code: 404,
          message: 'No se encontró la categoría',
          data: null
        }
        return Promise.reject(error)
      }
    })
    .catch(error => {
      message.failure(response, error.code, error.message, error.data)
    })
}

function addCategory(request, response) {
  let categoryPromise = findCategory(request.params.categoryId)
  let subCategoryPromise = findCategory(request.body.categoryId)
  Promise.all([categoryPromise, subCategoryPromise])
    .then(values => {
      let categoryId = null
      let subcategoryId = null
      if (values[0]) {
        categoryId = values[0]._id
      } else {
        return Promise.reject({ code: 404, message: 'No se encontró la categoría', data: null })
      }
      if (values[1]) {
        subcategoryId = values[1]._id
      } else {
        return Promise.reject({ code: 404, message: 'No se encontró la sub categoría', data: null })
      }
      return Category.update({ _id: categoryId }, { $push: { 'categories': subcategoryId } })
    })
    .then(() => {
      return findCategory(request.params.categoryId)
    })
    .then(category => {
      return Category.populate(category, { path: 'categories' })
    })
    .then(category => {
      message.success(response, 200, 'Sub categoría añadida con éxito', category.categories)
    })
    .catch(error => {
      message.failure(response, error.code, error.message, error.data)
    })
}

function removeCategory(request, response) {

  let categoryId = request.params.categoryId
  let subcategoryId = request.params.subcategoryId
  findCategory(request.params.categoryId)
    .then(category => {
      if (category) {
        return Category.update({ _id: categoryId }, { $pull: { categories: subcategoryId } })
      } else {
        return Promise.reject({ code: 404, message: 'No se encontró la categoría', data: null })
      }
    })
    .then(result => {
      return findCategory(request.params.categoryId)
    })
    .then(category => {
      message.success(response, 200, 'Sub categoría eliminada con éxito', category.categories)
    })
    .catch(error => {
      message.failure(response, error.code, error.message, error.data)
    })
}

function removeCategories(request, response) {
  findCategory(request.params.categoryId)
    .then(category => {
      let categoriesIds = JSON.parse(request.body.categories)
      let categoryId = request.params.categoryId
      return Promise.all(categoriesIds.map(id => {
        let subcategoryId = mongoose.Types.ObjectId(id)
        return Category.update({ _id: categoryId }, { $pull: { categories: subcategoryId } })
      }))
    })
    .then(() => {
      return findCategory(request.params.categoryId)
    })
    .then(category => {
      message.success(response, 200, 'Sub categorías eliminadas con éxito', category.categories)
    })
    .catch(error => {
      message.failure(response, error.code, error.message, error.data)
    })
}

module.exports = {
  getAllCategories,
  retrieveAllCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  // deleteCategories,
  getCategories,
  addCategory,
  removeCategory,
  removeCategories
}