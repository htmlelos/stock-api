'use strict';
const Product = require('../models/product')
const message = require('../services/response/message')

//Obtiene todos los productos
function getAllProducts(request, response) {
    Product.find({})
        .then(products => {
            message.success(response, { status: 200, message: '', data: products })
        })
        .catch(error => {
            message.failucer(response, { status: 404, message: '', data: error })
        })
}

// Crea un nuevo producto
function createProduct(request, response) {
    // Crea una nueva instancia de producto con los parametros recibidos
    let newProduct = new Product(request.body)

    newProduct.save()
        .then(product => {
            message.success(response, { status: 200, message: 'Producto creado con exito', data: null })
        })
        .catch(error => {
            if (error.code === 11000) {
                message.duplicate(response, { status: 422, message: 'El producto ya existe', data: null })
            } else {
                message.error(response, { status: 422, message: '', data: error })
            }
        })
}
// Obtener un producto
function findProduct(productId) {
    return Product.findById({ _id: productId })
}
// Obtiene un producto por su Id
function getProduct(request, response) {
    findProduct(request.params.productId)
        .then(product => {
            if (product) {
                message.success(response, { status: 200, message: 'Producto obtenido con exito', data: product })
            } else {
                message.failure(response, { status: 404, message: 'No se encontró el producto', data: null })
            }
        })
        .catch(error => {
            message.error(response, { status: 422, message: '', data: error })
        })
}
// Asigna el nuevo dato al producto
function assignProduct(oldValue, newValue) {
    return Object.assign(oldValue, newValue).save()
}
// Actualiza un producto
function updateProduct(request, response) {
    // Encuentra el usuario a actualizar
    findProduct(request.params.productId)
        .then(product => {
            // Si el producto existe se actualiza con los datos proporcionados
            if (product) {
                assignProduct(product, request.body)
                    .then(user => {
                        message.success(response, { status: 200, message: 'Producto actualizado con exito', data: product })
                    })
                    .catch(error => {
                        if (error.code === 11000) {
                            message.duplicate(response, { status: 422, message: 'El producto ya existe', data: null })
                        } else {
                            message.error(response, { status: 422, message: '', data: error })
                        }
                    })
            } else {
                message.failure(response, { status: 404, message: 'El producto, no es un producto valido', data: null })
            }
        })
        .catch(error => {
            message.error(response, { status: 422, message: '', data: error })
        })
}

module.exports = {
    getAllProducts,
    createProduct,
    getProduct,
    updateProduct
}