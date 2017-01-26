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


module.exports = router