'use strict';
const Category = require('../models/category')
const message = require('../services/response/message')

function getAllCategories(request, response) {
  Category.find({})
    .then(roles => {
      message.success(response, 200, '', roles)
    })
    .catch(error => {
      message.error(response, 422, '', error)
    })
  // Crea una nueva Categooria

}

function createCategory(request, response) {
  // Crea una nueva instanscia de Category con los parametros recibidos
  // console.log('CREATE--')
  let newCategory = new Category(request.body)

  newCategory.createdBy = request.decoded.username
  newCategory.save()
    .then(category => {
      message.success(response, 200, 'categoría creada con éxito', {id: category._id})
    })
    .catch(error => {
      if (error.code === 11000) {
        message.duplicate(response, 422, 'El rol ya existe', null)
      } else {
        message.error(response, 422, '', error)
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
        message.success(response, 200, 'categoría obtenida con éxito', category)
      } else {
        message.failure(response, 404, 'No se encontro la categoría', null)
      }
    })
    .catch(error => {
      message.failure(response, 500, 'El sistema tuvo un fallo al recuperar la categoría', null)
    })
}

function updateCategory(request, response) {
  findCategory(request.params.categoryId)
    .then(category => {
      if (category) {
        let newCategory = request.body
        newCategory.updatedBy = request.decoded.username
        newCategory.updatedAt = Date()
        // console.log('ACTUALIZADO--');
        return Category.update({_id: request.params.categoryId},{$set: newCategory}, {runValidators: true})
      } else {
        return Promise.reject({code: 404, message: 'No se encontró la categoría', data: null})
      }
    })
    .then(() => {
      // console.log('RESPONSE--', response);
      return findCategory(request.params.categoryId)
    })
    .then(category => {
      message.success(response, 200, 'categoría actualizada con éxito', {id: category._id})
    })
    .catch(error => {
      if (error.code === 11000) {
        message.duplicate(response, 422, 'La categoría ya existe', null)
      } else {
        message.failure(response, error.code, error.message, error.data)
      }
    })
}

function deleteCategory(request, response) {
    findCategory(request.params.categoryId)
    .then(category => {
      if (category) {
      Category.remove({_id: category.id})
        .then(category => {
          message.success(response, 200, 'categoría eliminada con éxito', null)
        })
        .catch(error => {
          message.error(response, 422, 'No se pudo eliminar la categoría', error)
        })
      } else {
        message.failure(response, 404, 'La categoría no es válida', null)
      }
    })
    .catch(error => {
      message.error(response, 422, 'No se pudo recuperar ', error)
    })
  }

function getCategories(request, response) {
  findCategory(request.params.categoryId)
    .then(category => {
      console.log('categoría--', category)
      if (category) {
        message.success(response, 200, 'Subcategorías obtenidas con éxito', category.categories)
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
      console.error('ERROR--', error)
      message.failure(response, error.code, error.message, error.data)
    })
}

module.exports = {
  getAllCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategories
}