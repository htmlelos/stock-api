'use strict';
const Brand = require('../models/brand')
const Person = require('../models/person')
const Product = require('../models/product')
const PriceList = require('../models/priceList')
const message = require('../services/response/message')

//Obtiene todos los productos
function getAllProducts(request, response) {
    Product.find({})
        .then(products => {
            message.success(response, 200, '', products)
        })
        .catch(error => {
            message.failure(response, 404, 'No se pudieron recuperar los productos', error)
        })
}

// Crea un nuevo producto
function createProduct(request, response) {
    // Crea una nueva instancia de producto con los parametros recibidos
    let newProduct = new Product(request.body)

    newProduct.save()
        .then(product => {
            message.success(response, 200, 'Producto creado con exito', null)
        })
        .catch(error => {
            if (error.code === 11000) {
                message.duplicate(response, 422, 'El producto ya existe', null)
            } else {
                message.error(response, 422, 'No se pudo crear el usuario', error)
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
                Brand.populate(product, { path: 'brand' })
                    .then(product => {
                        message.success(response, 200, 'Producto obtenido con exito', product)
                    })
                    .catch(error => {
                        message.error(response, 422, '', error)
                    })
            } else {
                message.failure(response, 404, 'No se encontró el producto', null)
            }
        })
        .catch(error => {
            message.error(response, 422, '', error)
        })
}
// Actualiza un producto por su id
function updateProduct(request, response) {
    // Encuentra el usuario a actualizar
    findProduct(request.params.productId)
        .then(product => {
            // Si el producto existe se actualiza con los datos proporcionados
            if (product) {
                let newProduct = request.body
                newProduct.updatedBy = request.decoded.username
                newProduct.updatedAt = Date.now()
                Product.update({ _id: request.params.productId }, { $set: newProduct })
                    .then(user => {
                        message.success(response, 200, 'Producto actualizado con exito', null)
                    })
                    .catch(error => {
                        if (error.code === 11000) {
                            message.duplicate(response, 422, 'El producto ya existe', null)
                        } else {
                            message.error(response, 422, '', error)
                        }
                    })
            } else {
                message.failure(response, 404, 'El producto, no es un producto valido', null)
            }
        })
        .catch(error => {
            message.error(response, 422, '', error)
        })
}
// Elimina un producto por su id
function deleteProduct(request, response) {
    findProduct(request.params.productId)
        .then(product => {
            if (product) {
                Product.remove({ _id: product.id })
                    .then(product => {
                        message.success(response, 200, 'Producto eliminado con exito', null)
                    })
                    .catch(error => {
                        message.error(response, 422, '', error)
                    })
            } else {
                message.failure(response, 404, 'El producto, no es un producto valido', null)
            }
        })
        .catch(error => {
            message.error(response, 422, '', error)
        })
}

function getBrand(request, response) {
    findProduct(request.params.productId)
        .then(product => {
            if (product) {
                Brand.populate(product, { path: 'brand' })
                    .then(result => {
                        message.success(response, 200, 'Marca obtenida con exito', result.brand)
                    })
                    .catch(error => {
                        message.error(response, 422, '', error)
                    })
            } else {
                message.failure(response, 404, 'No se econtro el producto', null)
            }
        })
        .catch(error => {
            message.error(response, 422, '', error)
        })
}

function getAllPriceLists(request, response) {
    findProduct(request.params.productId)
        .then(product => {
            if (product) {
                PriceList.populate(product, {path: 'priceList'})
                    .then(result => {
                        message.success(response, 200, 'Listas de Precios obtenidas con exito', result.priceList)
                    })
                    .catch(error => {
                        message.error(response, 422, '', error)
                    })
            } else {
                message.failure(response, 404, 'El producto no es valido', null)
            }
        })
        .catch(error => {
            message.error(response, 422, '', error)
        })
}

// Obtener una lista de precios
function findPriceList(priceListId) {
    return PriceList.findById({ _id: priceListId })
}

function createProductList(request, response) {
   findProduct(request.params.productId)
    .then(product => {
        // console.log('--PRODUCT--',product);
        console.log('--BODY--', request.body);
        findPriceList(request.body.priceList)
            .then(priceList => {
                // console.log('--PRICE_LIST--', priceList);
                product.priceList.push(request.body)
                message.success(response, 200, 'Precio añadido con exito', product) 
            })
            .catch(error => {
                message.error(response, 404, 'La Lista de Precios no es valida', error)
            })
    })
    .catch(error => {
        message.error(response, 404, 'El producto no es valido', error)
    })
}

module.exports = {
    getAllProducts,
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    getBrand,
    getAllPriceLists,
    createProductList
}