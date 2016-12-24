'use strict';
const Supplier = require('../models/supplier')
const Brand = require('../models/brand')
const message = require('../services/response/message')

// Obtiene todas las marcas
function getAllBrands(request, response) {
  Brand.find({})
    .then(brands => {
      Supplier.populate(brands, { path: 'suppliers' })
        .then(user => {
          message.success(response, 200, '', brands)
        })
        .catch(error => {
          message.error(response, 422, 'No se pudo recuperar los proveedores de la marca', error)
        })

    })
    .catch(error => {
      message.failure(response, 404, 'No se pudo recuperar la marca', error)
    })
}

// Crear una nueva marca
function createBrand(request, response) {
  //Crea una nueva instancia de marca con los parametros recibidos
  let newBrand = new Brand(request.body)

  newBrand.createdBy = request.decoded.username
  newBrand.save()
    .then(brand => {
      message.success(response, 200, 'Marca creada con exito', null)
    })
    .catch(error => {
      if (error.code === 11000) {
        message.duplicate(response, 422, 'La marca ya existe', null)
      } else {
        message.error(response, 422, 'No se pudo crear la marca', error)
      }
    })
}
// Obtener una marca
function findBrand(brandId) {
  return Brand.findById({ _id: brandId })
}
// Obtener un usuario por su id
function getBrand(request, response) {
  findBrand(request.params.brandId)
    .then(brand => {
      if (brand) {
        Supplier.populate(brand, { path: 'suppliers' })
          .then(user => {
            message.success(response, 200, 'Marca obtenida con exito', brand)
          })
          .catch(error => {
            message.error(response, 422, 'No se pudo recuperar ', error)
          })
      } else {
        message.failure(response, 404, 'No se encontró la marca', null)
      }
    })
    .catch(error => {
      message.error(response, 500, 'No se pudo recuperar la marca', error)
    })
}

function assignBrand(oldValue, newValue) {
  return Object.assign(oldValue, newValue).save()
}

function updateBrand(request, response) {
  findBrand(request.params.brandId)
    .then(brand => {
      // Si la marca con el id proporcionado existe se actualiza con los datos proporcionados
      if (brand) {
        let newBrand = request.body
        newBrand.updatedBy = request.decoded.username
        newBrand.updatedAt = Date.now()
        Brand.findOne({ name: newBrand.name })
          .then(result => {
            if (!result) {
              Brand.update({ _id: request.params.productId }, { $set: newBrand }, { runValidators: true })
                .then(result => {
                  message.success(response, 200, 'Marca actualizada con exito', null)
                })
                .catch(error => {
                  if (error.code === 11000) {
                    message.duplicate(response, 422, 'La marca ya existe', null)
                  } else {
                    message.error(response, 422, 'No se pudo actualizar la marca', error)
                  }
                })
            } else {
              message.duplicate(response, 422, 'La marca ya existe', null)
            }
          })
          .catch(error => {
            message.error(response, 422, 'No se pudo actualizar la marca', error)
          })
      } else {
        message.failure(response, 404, 'La marca, no es una marca valida', null)
      }
    })
    .catch(error => {
      message.error(response, 422, 'No se pudo encontrar la marca', error)
    })
}

function deleteBrand(request, response) {
  findBrand(request.params.brandId)
    .then(brand => {
      if (brand) {
        Brand.remove({ _id: brand.id })
          .then(brand => {
            message.success(response, 200, 'Marca eliminada con exito', null)
          })
          .catch(error => {
            message.error(response, 422, '', error)
          })
      } else {
        message.failure(response, 404, 'La marca, no es una marca valida', null)
      }
    })
    .catch(error => {
      message.error(response, 500, 'No se pudo eliminar la marca', error)
    })
}

module.exports = {
  getAllBrands,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand
}