'use strict';
const person = require('../controllers/person')
const router = require('express').Router()

//GET /persons - Obtener todas las personas
router.route('/persons')
    .get(person.getAllPersons)

module.exports = router