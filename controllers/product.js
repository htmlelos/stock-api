'use strict';
const mongoose = require('mongoose')
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
            message.success(response, 200, 'Producto creado con éxito', { id: product.id })
        })
        .catch(error => {
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
                return Brand.populate(product, { path: 'brand' })
            } else {
                return Promise.reject({ code: 404, message: 'No se encontró el producto', data: null })
            }
        })
        .then(product => {
            return PriceList.populate(product, { path: 'priceLists.priceListId' })
        })
        .then(product => {
            message.success(response, 200, 'Producto obtenido con éxito', product)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}
// Actualiza un producto por su id
function updateProduct(request, response) {
    // Encuentra el usuario a actualizar
    findProduct(request.params.productId)
        .then(product => {
            if (product) {
                let newProduct = request.body
                newProduct.updatedBy = request.decoded.username
                newProduct.updatedAt = Date.now()
                return Product.update({ _id: request.params.productId }, { $set: newProduct }, { runValidators: true })
            } else {
                return Promise.reject({ code: '404', message: 'No se encontró el producto', data: null })
            }
        })
        .then(() => {
            message.success(response, 200, 'Producto actualizado con éxito', null)
        })
        .catch(error => {
            if (error.code && error.code === 11000) {
                message.failure(response, 422, 'El producto ya existe', null)
            } else {
                message.failure(response, error.code, error.message, error.data)
            }
        })
}
// Elimina un producto por su id
function deleteProduct(request, response) {
    findProduct(request.params.productId)
        .then(product => {
            if (product) {
                return Product.remove({ _id: product.id })
            } else {
                return Promise.reject({ code: 404, message: 'No se encontró el producto', data: null })
            }
        })
        .then(() => {
            message.success(response, 200, 'Producto eliminado con éxito', null)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

function getBrand(request, response) {
    findProduct(request.params.productId)
        .then(product => {
            if (product) {
                return Brand.populate(product, { path: 'brand' })
            } else {
                return Promise.reject({ code: 404, message: 'No se encontró el producto', data: null })
            }
        })
        .then(product => {
            message.success(response, 200, 'Marca obtenida con éxito', product.brand)
        })
        .catch(error => {
            message.error(response, erro.code, error.message, error.data)
        })
}

function getAllPriceLists(request, response) {
    findProduct(request.params.productId)
        .then(product => {
            if (product) {
                return PriceList.populate(product, { path: 'priceList' })
            } else {
                return Promise.reject({ code: 404, message: 'No se encontró el producto', data: null })
            }
        })
        .then(product => {
            message.success(response, 200, 'Listas de Precios obtenidas con éxito', product.priceLists)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

// Obtener una lista de precios
function findPriceList(priceListId) {
    return PriceList.findById({ _id: priceListId })
}

function addPriceList(request, response) {
    let promiseProduct = findProduct(request.params.productId)
    let promisePriceList = findPriceList(request.body.priceListId)
    let productId = null;
    let priceList = null;
    Promise.all([promiseProduct, promisePriceList])
        .then(values => {

            if (values[0]) {
                productId = values[0]._id
            } else {
                return Promise.reject({ code: 404, message: 'No se encontró el producto', data: null })
            }
            if (values[1]) {
                priceList = values[1]
            } else {
                return Promise.reject({ code: 404, message: 'No se encontró la lista de precios', data: null })
            }

            return findProduct(request.params.productId)
        })
        .then(product => {
            let pendientes = product.priceLists.filter(x => {
                return (x.priceListId.toString() === priceList._id.toString() && x.status === 'PENDIENTE')
            });
            if (pendientes.length !== 0) {
                return Product.update({ 'priceLists._id': pendientes[0]._id }, { $set: { 'priceLists.$.status': 'ANULADO' } })
            }
        })
        .then(product => {
            return Product.update({ _id: productId }, { $push: { priceLists: request.body } })
        })
        .then(() => {
            return findProduct(request.params.productId)
        })
        .then(product => {
            message.success(response, 200, 'Precio añadido con éxito', product.priceLists)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

function removePriceList(request, response) {
    findProduct(request.params.productId)
        .then(product => {
            if (product) {
                let priceList = request.body
                return Product.update({ _id: product._id }, { $pull: { priceLists: priceList } })
            } else {
                return Promise.reject({ code: 404, message: 'No se encontró el producto', data: null })
            }
        })
        .then(() => {
            return findProduct(request.params.productId)
        })
        .then(product => {
            return PriceList.populate(product, { path: 'priceLists.priceListId' })
        })
        .then(product => {
            message.success(response, 200, 'Producto añadido con éxito', producto.priceLists)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

function addComponent(request, response) {
    let promiseProduct = findProduct(request.params.productId);
    let promiseComponent = findProduct(request.body.componentId)
    Promise.all([promiseProduct, promiseComponent])
        .then(values => {
            let productId = null;
            let componentId = null;
            if (values[0]) {
                productId = values[0]._id;
            } else {
                return Promise.reject({ code: 404, message: 'No se encontró el producto', data: null })
            }
            if (values[1]) {
                componentId = values[1]._id
            } else {
                return Promise.reject({ code: 404, message: 'No se encontró el componente', data: null })
            }
            return Product.update({ _id: productId }, { $push: { components: request.body } })
        })
        .then(() => {
            return findProduct(request.params.productId)
        })
        .then(product => {
            return Product.populate(product.components, { path: 'componentId' })
        })
        .then(components => {
            components = components.map(component => {
                return {
                    _id: component._id,
                    quantity: component.quantity,
                    unit: component.unit,
                    name: component.componentId.name,
                    code: component.componentId.code,
                    brand: component.componentId.brand,
                    status: component.componentId.status,
                    createdBy: component.componentId.createdBy,
                    createdAt: component.componentId.createdAt
                }
            })
            message.success(response, 200, 'Componente agregado con éxito', components)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

function getComponents(request, response) {

    findProduct(request.params.productId)
        .then(producto => {
            return Promise.all(producto.components.map(component => {
                return Product.populate(component, { path: 'componentId' })
            }))
        })
        .then(componentes => {
            return Promise.all(componentes.map(component => {
                return Product.populate(component, { path: '_id' })
            }))
        })
        .then(components => {
            components = components.map(component => {
                return {
                    _id: component._id,
                    quantity: component.quantity,
                    unit: component.unit,
                    name: component.componentId.name,
                    code: component.componentId.code,
                    brand: component.componentId.brand,
                    status: component.componentId.status,
                    createdBy: component.componentId.createdBy,
                    createdAt: component.componentId.createdAt
                }
            })
            message.success(response, 200, 'Componentes recuperados con éxito', components)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

function removeComponents(request, response) {
    findProduct(request.params.productId)
        .then(product => {
            let componentIds = JSON.parse(request.body.components)
            // let componentIds = request.body.components
            let productId = request.params.productId
            return Promise.all(componentIds.map(id => {
                let componentId = mongoose.Types.ObjectId(id)
                return Product.update({ _id: productId }, { $pull: { components: { _id: componentId } } })
            }))
        })
        .then(values => {
            // console.log('VALUES--', values)
            return findProduct(request.params.productId)
        })
        .then(product => {
            // console.log('PRODUCT--', product.components)
            return Product.populate(product.components, { path: 'componentId' })
        })
        .then(components => {
            //  console.log('COMPONENTES--', components)

            components = components.map(component => {
                return {
                    _id: component._id,
                    quantity: component.quantity,
                    unit: component.unit,
                    name: component.componentId.name,
                    code: component.componentId.code,
                    brand: component.componentId.brand,
                    status: component.componentId.status,
                    createdBy: component.componentId.createdBy,
                    createdAt: component.componentId.createdAt
                }
            })
            // console.log('COMPONENTS--', components)
            message.success(response, 200, 'Componentes eliminados con éxito', components)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
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
    addPriceList,
    removePriceList,
    addComponent,
    getComponents,
    removeComponents
}