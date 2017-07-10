'use strict';
const mongoose = require('mongoose')
const Brand = require('../models/brand')
const Person = require('../models/person')
const Product = require('../models/product')
const PriceList = require('../models/priceList')
const Category = require('../models/category')
const message = require('../services/response/message')

//Obtiene todos los productos
function getAllProducts(request, response) {
    Product.find({})
        .then(products => {
            return Promise.all(products.map(product => {
                return Brand.populate(product, { path: 'brand' })
            }))
        })
        .then(products => {
            return Promise.all(products.map(product => {
                return Category.populate(product, { path: 'category' })
            }))
        })
        .then(products => {
            message.success(response, 200, '', products)
        })
        .catch(error => {
            message.failure(response, 500, 'No se pudo recuperar los productos', error)
        })
}
function retrieveAllProducts(request, response) {
    let limit = parseInt(request.body.limit)
    let fields = request.body.fields
    let filter = request.body.filter
    let sort = request.body.sort

    Product.find(filter)
        .select(fields)
        .limit(limit)
        .sort(sort)
        .then(products => {
            return Promise.all(products.map(product => {
                return Category.populate(product, { path: 'category' })
            }))
        })
        .then(products => {
            return Promise.all(products.map(product => {
                return PriceList.populate(product, { path: 'priceLists.priceListId' })
            }))
        })
        .then(products => {
            return Promise.all(products.map(product => {
                return Brand.populate(product, { path: 'brand' })
            }))
        })
        .then(products => {
            return Promise.all(products.map(product => {
                return Product.populate(product, { path: 'components.componentId' })
            }))
        })
        .then(products => {
            message.success(response, 200, '', products)
        })
        .catch(error => {
            message.failure(response, 404, 'No se pudieron recuperar los productos', error)
        })
}
// Verifica los datos del producto
function checkProduct(request) {
    request.checkBody('name', 'El nombre del producto esta vacio')
        .notEmpty()
    request.checkBody('business', 'Debe indicar la empresa a la que pertenece producto')
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
            return Category.populate(product, { path: 'category' })
        })
        .then(product => {
            return PriceList.populate(product, { path: 'priceLists.priceListId' })
        })
        .then(product => {
            return Product.populate(product, { path: 'components.componentId' })
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
            message.failure(response, erro.code, error.message, error.data)
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
    let productId = request.params.productId;
    let priceListId = request.body.priceListId
    let promiseProduct = findProduct(productId)
    let promisePriceList = findPriceList(priceListId)
    Promise.all([promiseProduct, promisePriceList])
        .then(values => {
            let product = values[0];
            let priceList = values[1];
            if (!product) {
                return Promise.reject({ code: 404, message: 'No se encontró el producto', data: null })
            }
            if (!priceList) {
                return Promise.reject({ code: 404, message: 'No se encontró la lista de precios', data: null })
            }
            return findProduct(productId)
        })
        .then(product => {
            // Si existen producto pendientes de aprobacion son actualizados en estado ANULADO
            let pendientes = product.priceLists.filter(x => {
                return (x.priceListId.toString() === priceListId.toString() && x.status === 'PENDIENTE')
            });
            if (pendientes.length !== 0) {
                return Product.update({ 'priceLists._id': pendientes[0]._id }, { $set: { 'priceLists.$.status': 'ANULADO' } })
            }
        })
        .then(() => {
            return findProduct(request.params.productId)
        })
        .then(product => {
            product.updatedBy = request.decoded.username
            product.updatedAt = Date.now()
            product.priceLists.push(request.body)
            return Product.update({ _id: product._id }, { $push: { priceLists: request.body }, updatedBy: product.updatedBy, updatedAt: product.updatedAt }, { runValidators: true })
        })
        .then((result) => {
            return findProduct(productId)
        })
        .then(product => {
            return PriceList.populate(product, {path: 'priceLists.priceListId'})
        })        
        .then(product => {
            message.success(response, 200, 'Precio añadido con éxito', product.priceLists)
        })
        .catch(error => {
            if (error.code) {
                message.failure(response, error.code, error.message, error.data)
            } else {
                message.failure(response, 500, error.message, null)
            }
        })
}

function addComponent(request, response) {
    let productId = request.params.productId
    let componentId = request.body.componentId
    let promiseProduct = findProduct(productId)
    let promiseComponent = findProduct(componentId)
    Promise.all([promiseProduct, promiseComponent])
        .then(values => {
            let product = values[0];
            let component = values[1];
            if (!product) {
                return Promise.reject({ code: 404, message: 'No se encontró el producto', data: null })
            }
            if (!component) {
                return Promise.reject({ code: 404, message: 'No se encontró el componente', data: null })
            }
            product.updatedBy = request.decoded.username
            product.updatedAt = Date.now()
            return Product.update({ _id: product._id }, { $push: { components: request.body }, updatedBy: product.updatedBy, updatedAt: product.updatedAt })
        })
        .then(() => {
            return findProduct(productId)
        })
        .then(product => {
            return Product.populate(product.components, { path: 'componentId' })
        })
        .then(components => {
            message.success(response, 200, 'Componente agregado con éxito', components)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

function getComponents(request, response) {
    let productId = request.params.productId
    findProduct(productId)
        .then(product => {
            return Promise.all(product.components.map(component => {
                return Product.populate(component, { path: 'componentId' })
            }))
        })
        .then(componentes => {
            return Promise.all(componentes.map(component => {
                return Product.populate(component, { path: '_id' })
            }))
        })
        .then(components => {
            message.success(response, 200, 'Componentes recuperados con éxito', components)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

function removeComponents(request, response) {
    let productId = request.params.productId
    findProduct(productId)
        .then(product => {
            let componentIds = JSON.parse(request.body.components)
            product.updatedBy = request.decoded.username
            product.updatedAt = Date.now()
            return Promise.all(componentIds.map(id => {
                let componentId = mongoose.Types.ObjectId(id)
                return Product.update({ _id: productId }, { $pull: { components: { _id: componentId } }, updatedBy: product.updatedBy, updatedAt: product.updatedAt })
            }))
        })
        .then(values => {
            return findProduct(request.params.productId)
        })
        .then(product => {
            return Product.populate(product.components, { path: 'componentId' })
        })
        .then(components => {
            // components = components.map(component => {
            //     return {
            //         _id: component._id,
            //         quantity: component.quantity,
            //         unit: component.unit,
            //         name: component.componentId.name,
            //         code: component.componentId.code,
            //         brand: component.componentId.brand,
            //         status: component.componentId.status,
            //         createdBy: component.componentId.createdBy,
            //         createdAt: component.componentId.createdAt
            //     }
            // })
            message.success(response, 200, 'Componentes eliminados con éxito', components)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

module.exports = {
    getAllProducts,
    retrieveAllProducts,
    createProduct,
    getProduct,
    updateProduct,
    deleteProduct,
    getBrand,
    getAllPriceLists,
    addPriceList,
    addComponent,
    getComponents,
    removeComponents
}