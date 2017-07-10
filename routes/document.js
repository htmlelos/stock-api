'use strict';

const document = require('../controllers/document')
const router = require('express').Router()

// GET /document - obtener todos los documentos
router.route('/documents')
    .get(document.getAllDocuments)
    .post(document.retrieveAllDocuments)

router.route('/document')
    .post(document.createDocument)

module.exports = router