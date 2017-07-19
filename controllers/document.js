const message = require('../services/response/message')
const Document = require('../models/document')
const Business = require('../models/business')
const Persona = require('../models/person')
const Product = require('../models/product')


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
        request.checkBody('documentNumber', `Debe indicar el numero de ${documentType.toLowerCase()}`)
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

    validateDocument(request)
        .then(() => {
            body = request.body;
            let document = new Document(body)
            document.createdBy = request.decoded.username
            document.createdAt = Date.now();
            return document.save()
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
                let error = {code: 404, message: 'No se encontró el documento', data: null}
                return Promise.reject(error)
            }

            if (!product) {
                let error = {code: 404, message: 'No se encontró el producto', data: null}
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
                return Document.update({_id: documentId}, {$pull: {detail: {_id: itemId}}})
            } else {
                let error = {code:404, message:'No se encontró el documento', data: null}
                return Promise.reject(error)
            }
        })
        .then(() => {
            return findDocument(documentId)
        })
        .then(document => {
            return Product.populate(document, {path: 'detail.product'})
        })
        .then(document => {            
            message.success(response, 200, 'Item eliminado con exito', document.detail)
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
    deleteItem
}