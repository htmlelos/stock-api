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
      message.success(response, 200, 'categoría creada con éxito', { id: category._id })
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
        message.failure(response, 404, 'No se encontró la categoría', null)
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
        return Category.update({ _id: request.params.categoryId }, { $set: newCategory }, { runValidators: true })
      } else {
        return Promise.reject({ code: 404, message: 'No se encontró la categoría', data: null })
      }
    })
    .then(() => {
      // console.log('RESPONSE--', response);
      return findCategory(request.params.categoryId)
    })
    .then(category => {
      message.success(response, 200, 'categoría actualizada con éxito', { id: category._id })
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
        Category.remove({ _id: category.id })
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
      let subCategoryId = null
      if (values[0]) {
        categoryId = values[0]._id
      } else {
        return Promise.reject({ code: 404, message: 'No se encontró la categoría', data: null })
      }
      if (values[1]) {
        subCategoryId = values[1]._id
      } else {
        return Promise.reject({ code: 404, message: 'No se encontró la sub categoría', data: null })
      }
      return Category.update({ _id: categoryId }, { $push: { 'categories': subCategoryId } })
    })
    .then(() => {
      return findCategory(request.params.categoryId)
    })
    .then(category => {
      return Category.populate(category, { path: 'categories' })
    })
    .then(category => {
      message.success(response, 200, 'Sub categoria añadida con éxito', category.categories)
    })
    .catch(error => {
      message.failure(response, error.code, error.message, error.data)
    })
}

function removeCategory(request, response) {
  let subcategoryId = request.params.subcategoryId
  findCategory(request.params.categoryId)
    .then(category => {
      if (category) {
        console.log('CATEGORIA--', category);
        return Category.update({ _id: category._id }, { $pull: { categories:  subcategoryId  } })
      } else {
        return Promise.reject({ code: 404, message: 'No se encontró la categoría', data: null })
      }
    })
  .then((result) => {
    console.log('RESULT--', result);
    return findCategory(request.params.categoryId)
  })
    .then(category => {
      message.success(response, 200, 'Sub categoría eliminada con éxito', category.categories)
    })
    .catch(error => {
      message.failure(response, error.code, error.message, error.data)
    })
}

module.exports = {
  getAllCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategories,
  addCategory,
  removeCategory
}