'use strict';
const Document = require('../models/document')
const message = require('../services/response/message')

// Obtener todos los documentos
function getAllDocuments(request, response) {
    Document.find({})
        .then(documents => {
            message.success(response, {
                status: 200,
                message: '',
                data: documents
            })
        })
        .catch(error => {
            message.error(response, {
                status: 422,
                message: '',
                data: error
            })
        })
}
// Crea un nuevo documento
// Obtener un documento por su id
// Actualizar un documento
// Eliminar un documento

module.exports = {
    getAllDocuments
}