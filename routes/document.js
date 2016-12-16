'use strict';

const document = require('../controllers/document')
const router = require('express').Router()

// GET /document - obtener todos los documentos
router.route('/document')
    .get(document.getAllDocuments)

module.exports = router