const message = require('../services/response/message')
const Document = require('../models/document')
const Business = require('../models/business')
const Persona = require('../models/person')
const Product = require('../models/product')
const Counter = require('../models/counter')
const mongoose = require('mongoose')


const getAllDocuments = (request, response) => {
    Document.find()
        .then(documents => {
            message.success(response, 200, '', documents)
        })
        .catch(error => {
            message.failure(response, 500, 'No se pudo recuperar los documentos', null)
        })
}

const retrieveAllDocuments = (request, response) => {
    let filter = request.params.filter
    let limit = request.params.limit
    let sort = request.params.sort
    let fields = request.params.fields
    Document.find(filter)
        .limit(limit)
        .sort(sort)
        .select(fields)
        .then(documents => {
            message.success(response, 200, '', documents)
        })
        .catch(error => {
            message.failure(response, 500, 'No se pudo recuperar los documentos', null)
        })
}

const checkDocument = (request) => {
    let documentType = request.body.documentType

    request.checkBody('documentType', 'El tipo de documento solo puede ser ORDEN, RECEPCION o FACTURA')
        .isIn('ORDEN', 'RECEPCION', 'FACTURA')
    request.checkBody('documentType', 'Debe indicar el tipo de Documento')
        .notEmpty()
    if (documentType !== null && documentType !== undefined) {
        request.checkBody('documentName', 'Debe indicar el nombre del documento')
            .notEmpty()
        request.checkBody('documentDate', `Debe indicar la fecha de ${documentType.toLowerCase()}`)
            .notEmpty()
        request.checkBody('business', 'Debe indicar la empresa que creó el documento')
            .notEmpty()
        request.checkBody('receiver', `Debe indicar el destinatario de ${documentType.toLowerCase()}`)
            .notEmpty()
        request.checkBody('sender', `Debe indicar el emisor de ${documentType.toLowerCase()}`)
            .notEmpty()
        request.checkBody('detail', `Debe indicar el detalle de ${documentType.toLowerCase()}`)
            .notEmpty()
        request.checkBody('subtotal', 'No se ha calculado correctamente el subtotal')
            .notEmpty()
        request.checkBody('salesTaxes', 'Debe indicar el porcentaje de retención de impuesto sobre las ventas')
            .notEmpty()
        request.checkBody('total', `No se ha calculado el total de ${documentType.toLowerCase()}`)
            .notEmpty()
    }
}

const validateDocument = (request) => {
    return new Promise((resolve, reject) => {

        request.getValidationResult()
            .then(result => {
                if (!result.isEmpty()) {
                    let messages = result.useFirstErrorOnly()
                        .array()
                        .map(x => x.msg)
                        .join(',')
                    let error = { code: 422, message: messages, data: null }
                    reject(error)
                }
                resolve()
            })
    })
}


const createDocument = (request, response) => {
    checkDocument(request)

    let document = null
    validateDocument(request)
        .then((x) => {
            body = request.body;
            document = new Document(body)
            document.createdBy = request.decoded.username
            document.createdAt = Date.now();
            return Counter.findOne({ name: document.documentType.toLowerCase() })
        })
        .then(counter => {
            document.documentNumber = counter.value + counter.incrementBy
            return Counter.update({ _id: counter._id }, { $set: { value: document.documentNumber } })
        })
        .then(value => {
            return document.save()
        })
        .then(value => {
            return Promise.resolve(document)
        })
        .catch(error => {
            return Promise.reject(error)
        })
        .then((document) => {
            message.success(response, 200, 'Documento creado con éxito', { id: document._id })
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

const findDocument = (documentId) => {
    return Document.findById({ _id: documentId })
}

const updateDocument = (request, response) => {
    let documentId = request.params.documentId
    findDocument(documentId)
        .then(document => {
            if (document) {
                let newDocument = request.body
                newDocument.username = request.decoded.username
                newDocument.updatedAt = Date.now()
                return Document.update({ _id: document._id }, { $set: newDocument }, { runValidators: true })
            } else {
                let error = { code: 404, message: 'No se encontró el documento', data: null }
                return Promise.reject(error)
            }
        })
        .then((result) => {
            return findDocument(documentId)
        })
        .then(document => {
            message.success(response, 200, 'Documento actualizado con éxito', document)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

const deleteDocument = (request, response) => {
    let documentId = request.params.documentId
    findDocument(documentId)
        .then(document => {
            if (document) {
                return Document.remove({ _id: document._id })
            } else {
                let error = { code: 404, message: 'No se encontró el documento', data: null }
                return Promise.reject(error)
            }
        })
        .then(() => {
            message.success(response, 200, 'Documento eliminado con éxito', null)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

const getDocument = (request, response) => {
    let documentId = request.params.documentId
    findDocument(documentId)
        .then(document => {
            if (document) {
                return Promise.resolve(document)
            } else {
                let error = { code: 404, message: 'No se encontró el documento', data: null }
                return Promise.reject(error)
            }
        })
        .then(document => {
            return Business.populate(document, { path: 'business' })
        })
        .then(document => {
            return Persona.populate(document, { path: 'receiver' })
        })
        .then(document => {
            return Persona.populate(document, { path: 'sender' })
        })
        .then(document => {
            message.success(response, 200, 'Documento obtenido con éxito', document)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

const findProduct = (itemId) => {
    return Product.findById({ _id: itemId })
}

const addItem = (request, response) => {
    let documentId = request.params.documentId
    let item = request.body
    let productId = item.product
    let promiseItem = findProduct(productId)
    let promiseDocument = findDocument(documentId)

    Promise.all([promiseItem, promiseDocument])
        .then(values => {
            let product = values[0]
            let document = values[1]

            if (!document) {
                let error = { code: 404, message: 'No se encontró el documento', data: null }
                return Promise.reject(error)
            }

            if (!product) {
                let error = { code: 404, message: 'No se encontró el producto', data: null }
                return Promise.reject(error)
            }

            return Document.update({ _id: documentId }, { $push: { detail: item } })

        })
        .then((result) => {
            return findDocument(documentId)
        })
        .then(document => {
            message.success(response, 200, 'Item agregado con éxito', document.detail)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

const deleteItem = (request, response) => {
    let documentId = request.params.documentId
    let promiseDocument = findDocument(documentId)

    findDocument(documentId)
        .then(document => {
            if (document) {
                itemId = request.body.itemId
                return Document.update({ _id: documentId }, { $pull: { detail: { _id: itemId } } })
            } else {
                let error = { code: 404, message: 'No se encontró el documento', data: null }
                return Promise.reject(error)
            }
        })
        .then(() => {
            return findDocument(documentId)
        })
        .then(document => {
            return Product.populate(document, { path: 'detail.product' })
        })
        .then(document => {
            message.success(response, 200, 'Item eliminado con exito', document.detail)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

const generate = (request, response) => {
    let documentId = request.params.documentId
    let counterValue = 0
    let newDocument = null
    let promiseDocument = findDocument(documentId)
    let promiseCounter = Counter.findOne({ name: 'recepcion' })
    // findDocument(documentId)
    Promise.all([promiseDocument, promiseCounter])
        .then(values => {
            let document = values[0]
            console.log('DOCUMENT', document);
            let counter = values[1]
            let receipt = {
                documentNumber: counter.value,
                documentType: 'RECEPCION',
                documentName: 'Recepcion de Productos',
                documentDate: document.documentDate,
                sender: document.receiver,
                receiver: request.decoded._id,
                detail: document.detail
            }

            if (document.status === 'GENERADO') {
                let error = { code: 422, message: 'No se puede generar una recepcion si la orden ya fue generada', data: null }
                return Promise.reject(error)
            }

            counterValue = counter.value + 1

            newDocument = new Document(receipt)
            return [newDocument.save(),
            Counter.update({ name: 'recepcion' }, { $set: { value: counterValue } })]
        })
        .then((result) => {
            console.log('RESULT--', result);
            return Promise.all(result)
        })
        .then(document => {
            console.log('DOCUMENT--', document);
            message.success(response, 200, `${document[0].documentType.toLowerCase()} generada con exito`, document);
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

const acceptItem = (request, response) => {
    let documentId = request.params.documentId
    let items = request.body.items
    let promiseDocument = Document.findById(documentId)
        .then(document => {
            if (document) {
                if (document.status === 'CONFIRMADO') {
                    let error = { code: 400, message: 'La recepcion ya se encuentra confirmada', data: null }
                    return Promise.reject(error)
                }
                return document.detail.map(item => {
                    return (items.includes(item._id.toString()) && item.status !== 'ACEPTADO') ? Object.assign(item, { status: 'ACEPTADO' }) : item
                })
            } else {
                let error = { code: 404, message: 'no se pudo encontrar el documento', data: null }
                return Promise.reject(error)
            }
        })
        .then(detail => {
            return Document.update({ _id: documentId }, { $set: { detail, status: 'PROCESANDO' } })
        })
        .then(() => {
            return Document.findById(documentId)
        })
        .then(document => {
            message.success(response, 200, 'Dato recuperado', document)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

const rejectItem = (request, response) => {
    let documentId = request.params.documentId
    let items = request.body.items
    let promiseDocument = Document.findById(documentId)
        .then(document => {
            if (document) {
                if (document.status === 'CONFIRMADO') {
                    let error = { code: 400, message: 'La recepcion ya se encuentra confirmada', data: null }
                    return Promise.reject(error)
                }
                return document.detail.map(item => {
                    return (items.includes(item._id.toString()) && item.status !== 'RECHAZADO') ? Object.assign(item, { status: 'RECHAZADO' }) : item
                })
            } else {
                let error = { code: 404, message: 'no se pudo encontrar el documento', data: null }
                return Promise.reject(error)
            }
        })
        .then(detail => {
            return Document.update({ _id: documentId }, { $set: { detail, status: 'PROCESANDO' } })
        })
        .then(() => {
            return Document.findById(documentId)
        })
        .then(document => {
            message.success(response, 200, 'Dato recuperado', document)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

const missingItem = (request, response) => {
    let documentId = request.params.documentId
    let items = request.body.items
    let promiseDocument = Document.findById(documentId)
        .then(document => {
            if (document) {
                if (document.status === 'CONFIRMADO') {
                    let error = { code: 400, message: 'La recepcion ya se encuentra confirmada', data: null }
                    return Promise.reject(error)
                }
                return document.detail.map(item => {
                    return (items.includes(item._id.toString()) && item.status !== 'FALTANTE') ? Object.assign(item, { status: 'FALTANTE' }) : item
                })
            } else {
                let error = { code: 404, message: 'no se pudo encontrar el documento', data: null }
                return Promise.reject(error)
            }
        })
        .then(detail => {
            return Document.update({ _id: documentId }, { $set: { detail, status: 'PROCESANDO' } })
        })
        .then(() => {
            return Document.findById(documentId)
        })
        .then(document => {
            message.success(response, 200, 'Dato recuperado', document)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

const confirmReceipt = (request, response) => {
    let documentId = request.params.documentId;
    Document.findById(documentId)
        .then(document => {
            if (document) {
                if (document.status === 'CONFIRMADO') {
                    let error = {code: 400, message: 'La recepcion ya se encuentra confirmada', data: null}
                    return Promise.reject(error)
                }
                return Document.update({_id:documentId},{$set:{status:'CONFIRMADO'}})
            } else {
                let error = {code: 404, message: 'Documento no encontrado', data: null}
                return Promise.reject(error)
            }
        })
        .then(() => {
            return Document.findById(documentId)
        })
        .then(document => {
            message.success(response, 200, `${document.type} ha sido confirmado`, document)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

module.exports = {
    getAllDocuments,
    retrieveAllDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    addItem,
    deleteItem,
    generate,
    acceptItem,
    rejectItem,
    missingItem,
    confirmReceipt
}