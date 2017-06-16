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
// Crea un nuevo documento
// Obtener un documento por su id
// Actualizar un documento
// Eliminar un documento

module.exports = {
    getAllDocuments,
    retrieveAllDocuments
}