'use strict';
const Person = require('../models/person')
const message = require('../services/response/message')

//Obtener todos los proveedores
function getAllPersons(request, response) {
    Person.find({})
        .then(persons => {            
            message.success(response, 200, '', persons)
        })
        .catch(error => {
            message.error(response, 422, '', error)
        })
}
// Crea una nueva persona en la base de datos
function createPerson(request, response) {
    // Crea una nueva instancia de una persona con los parametros recibidos
    // console.log('--NEW PERSON--', request.body);
    let newPerson = new Person(request.body)    
    newPerson.save()
        .then(person => {
            message.success(response, 200, `${person.type} creado con exito`, {id: person._id})
        })
        .catch(error => {
            // console.error('--ERROR--', error);
            if (error.code === 11000) {
                message.error(response, 422, 'Persona ya existe', error)
            } else {
                message.error(response, 422, '', error)
            }
        })
}

module.exports = {
    getAllPersons,
    createPerson
}