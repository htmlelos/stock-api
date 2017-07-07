const message = require('../services/response/message')
const Document = require('../models/document')
const Business = require('../models/business')

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

module.exports = {
    getAllDocuments,
    retrieveAllDocuments,
    createDocument
}