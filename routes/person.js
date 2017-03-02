'use strict';
const person = require('../controllers/person')
const router = require('express').Router()

//GET /persons - Obtener todas las personas
router.route('/persons')
    .get(person.getAllPersons)
// POST /person - Crea una nueva persona
router.route('/person')
    .post(person.createPerson)
// GET /person/:personId - Obtener una persona por su id
// PUT /person/:personId - Actualizar una persona por su id
// DELETE /person/:personId - Eliminar una persona por su id
router.route('/person/:personId')
    .get(person.getPerson)
    .put(person.updatePerson)
    .delete(person.deletePerson)
// GET /person/:personId/contacts - Obtener todos los contactos de una Persona
router.route('/person/:personId/contacts')
    .get(person.getAllContacts)
// POST /person/:personId/contact - Agregar un contacto a una persona
router.route('/person/:personId/contact')
    .post(person.addContact)
// DELETE /person/:personId/contact/:contactId
router.route('/person/:personId/contact/:contactId')
    .delete(person.removeContact)
// DELETE /person/:personId/contacts
router.route('/person/:personId/contacts')
    .delete(person.removeContacts)
// GET /person/:personId/addresses
router.route('/person/:personId/addresses')
    .get(person.getAllAddresses)
// POST /person/:personId/address
router.route('/person/:personId/address')
    .post(person.addAddress)
// DELETE /person/:personId/address/:addressId
router.route('/person/:personId/address/:addressId')    
    .delete(person.removeAddress)
// DELETE /person/:personId/addresses    
router.route('/person/:personId/addresses')
    .delete(person.removeAddresses)
module.exports = router