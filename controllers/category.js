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
  let newCategory = new Category(request.body)

  newCategory.createdBy = request.decoded.username
  newCategory.save()
    .then(category => {
      message.success(response, 200, 'Categoria creada con éxito', category)
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
        message.success(response, 200, 'Categoria obtenida con éxito', category)
      } else {
        message.failure(response, 404, 'No se encontro la categoria', null)
      }
    })
    .catch(error => {
      message.failure(response, 500, 'El sistema tuvo un fallo al recuperar la categoria', null)
    })
}

function updateCategory(request, response) {
  findCategory(request.params.categoryId)
    .then(category => {
      if (category) {
        let newCategory = request.body
        newCategory.updatedBy = request.decoded.username
        newCategory.updatedAt = Date()
        return Category.update({_id: request.params.roleId},{$set: newCategory}, {runValidators: true})
      } else {
        return Promise.reject({code: 404, message: 'No se encontro la categoria', data: null})
      }
    })
    .catch(error => {
      if (error.code === 11000) {
        message.duplicate(response, 422, 'El categoria ya existe', null)
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
          message.error(response, 200, 'Categoria eliminada con éxito', null)
        })
        .catch(error => {
          message.error(response, 422, '', error)
        })
      } else {
        message.failure(response, 404, 'LA categoria no es válida', null)
      }
    })
    .catch(error => {
      message.error(response, 422, 'No se pudo recuperar ', error)
    })
  }

module.exports = {
  getAllCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory
}