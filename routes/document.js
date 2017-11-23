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

router.route('/document/:documentId/generate-receipt')
    .post(document.generate)

router.route('/document/:documentId/accept-item')
    .post(document.acceptItem)

router.route('/document/:documentId/reject-item')
    .post(document.rejectItem)

router.route('/document/:documentId/missing-item')
    .post(document.missingItem)

router.route('/document/:documentId/confirm-receipt')
    .post(document.confirmReceipt)

router.route('/document/:documentId/confirm-transfer')
    .post(document.confirmTransfer)

module.exports = router