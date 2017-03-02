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
            message.failure(response, 500, 'No se pudo recuperar los productos', error)
        })
}

function saveProduct(product) {
    console.log('SAVE_PRODUCT', product);
    return
}
// Verifica los datos del producto
function checkProduct(request) {
    request.checkBody('name', 'El nombre del producto esta vacio')
        .notEmpty()
}
// Crea un nuevo producto
function createProduct(request, response) {
    checkProduct(request)        
    request.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) {
                let messages = result.useFirstErrorOnly().array().map(x => x.msg).join(',')
                return Promise.reject({ code: 422, messages, data: null })
            }
            return Promise.resolve()
        })
        .then(() => {
            // Crea una nueva instancia de producto con los parametros recibidos
            let product = new Product(request.body)
            product.createdBy = request.decoded.username
            return product.save()
        })    
        .then(product => {
            // console.log('PRODUCT--', product);
            message.success(response, 200, 'Producto creado con éxito', { id: product.id })
        })
        .catch(error => {
            // console.error('ERROR--', error);
            if (error.code === 11000)
                message.failure(response, 422, 'El producto ya existe', null)
            else                
                message.failure(response, error.code, error.messages, error.data)
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
                        message.success(response, 200, 'Producto obtenido con éxito', product)
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
                Product.update({ _id: request.params.productId }, { $set: newProduct }, { runValidators: true })
                    .then(user => {
                        message.success(response, 200, 'Producto actualizado con éxito', null)
                    })
                    .catch(error => {
                        if (error.code === 11000) {
                            message.duplicate(response, 422, 'El producto ya existe', null)
                        } else {
                            message.error(response, 422, '', error)
                        }
                    })
            } else {
                message.failure(response, 404, 'El producto, no es un producto válido', null)
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
                        message.success(response, 200, 'Producto eliminado con éxito', null)
                    })
                    .catch(error => {
                        message.error(response, 422, '', error)
                    })
            } else {
                message.failure(response, 404, 'El producto, no es un producto válido', null)
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
                        message.success(response, 200, 'Marca obtenida con éxito', result.brand)
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
                PriceList.populate(product, { path: 'priceList' })
                    .then(result => {
                        message.success(response, 200, 'Listas de Precios obtenidas con éxito', result.priceList)
                    })
                    .catch(error => {
                        message.error(response, 422, '', error)
                    })
            } else {
                message.failure(response, 404, 'El producto no es válido', null)
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

function addPriceList(request, response) {
    findProduct(request.params.productId)
        .then(product => {
            if (product) {
                findPriceList(request.body.priceList)
                    .then(priceList => {
                        if (priceList) {
                            let price = request.body
                            let isIncluded = product.priceList
                                .map(current => current.toString())
                                .includes(priceList._id.toString())

                            if (isIncluded) {
                                message.failure(response, 422, 'La Lista de Precios ya se encuentra asociada al Producto', null)
                            } else {
                                Product.update({ _id: product._id }, { $addToSet: { priceList: price } })
                                    .then(result => {
                                        message.success(response, 200, 'Precio añadido con éxito', product)
                                    })
                                    .catch(error => {
                                        message.error(response, 500, 'No se pudo añadir la Lista de Precios al producto', error)
                                    })
                            }
                        } else {
                            message.failure(response, 404, 'La Lista de Precios no es valida', null)
                        }
                    })
                    .catch(error => {
                        message.error(response, 422, 'La Lista de Precios no es valida', error)
                    })
            } else {
                message.failure(response, 404, 'El producto no es válido', null)
            }
        })
        .catch(error => {
            message.error(response, 500, 'El producto no es válido', error)
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
    addPriceList
}