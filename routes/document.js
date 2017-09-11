'use strict';

const document = require('../controllers/document')
const router = require('express').Router()

// GET /document - obtener todos los documentos
router.route('/documents')
    .get(document.getAllDocuments)
    .post(document.retrieveAllDocuments)

router.route('/document')
    .post(document.createDocument)

router.route('/document/:documentId')
    .put(document.updateDocument)
    .delete(document.deleteDocument)
    .get(document.getDocument)

router.route('/document/:documentId/item')
    .post(document.addItem)
    .delete(document.deleteItem)

router.route('/document/:documentId/generate')
    .post(document.generate)

module.exports = router