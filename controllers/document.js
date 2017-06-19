'use strict';
const Document = require('../models/document')
const message = require('../services/response/message')

// Obtener todos los documentos
function getAllDocuments(request, response) {
    Document.find({})
        .then(documents => {
            message.success(response,
                200,
                '',
                documents
            )
        })
        .catch(error => {
            console.log('ERROR--', error);
            message.failure(response,
                422,
                '',
                error
            )
        })
}
// Obtener un documento segun el criterio indicado
function retrieveAllDocuments(request, response) {
    let filter = request.body.filter
    let limit = request.body.limit
    let fields = request.body.fields
    let sort = request.body.sort
    Document.find(filter)
        .limit(limit)
        .select(fields)
        .sort(sort)
        .then(documents => {
            message.success(response, 200, '', documents)
        })
        .catch(error => {
            message.failure(response, 404, 'No se pudo encontrar documentos', error)
        })
}
function checkOrder(request) {
    console.log('REQUEST_BODY--', request.body);
    const documentType = request.body.header.type;
    if (documentType === 'ORDEN') {
        request.checkBody('header.documentNumber', 'Debe indicar un número de factura')
            .notEmpty()
        request.checkBody('header.documentDate', 'Debe indicar la fecha del comprobante')
            .notEmpty()
        request.checkBody('header.status', `Debe definir el estado de la ${documentType}`)
            .notEmpty()            
        request.checkBody('header.status', `El estado de la ${documentType} solo puede ser ACTIVO o INACTIVO`)
            .isIn('ACTIVO', 'INACTIVO')
        request.checkBody('actors', 'Debe definir un actor en el documento')
            .notEmpty()
    }
}
// Crea un nuevo documento
function createDocument(request, response) {
    checkOrder(request)

    request.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) {
                let messages = result.useFirstErrorOnly()
                    .array()
                    .map(x => x.msg)
                    .join(',')
                return Promise.reject({ code: 422, message: messages, data: null })
            }
            return Promise.resolve()
        })
        .then(() => {
            let newDocument = new Document(request.body)
            newDocument.createdBy = request.decoded.username
            return newDocument.save()
        })
        .then(
        document => {
            console.log('DOCUMENT--', document);
            message.success(response, 200, 'Documento creado con exito', { id: 1 })
        }
        )
        .catch(error => {
            console.log('ERROR--', error);
            message.failure(response, error.code, error.message, error.data)
        })

}
// Obtener un documento por su id
// Actualizar un documento
// Eliminar un documento

module.exports = {
    getAllDocuments,
    retrieveAllDocuments,
    createDocument
}