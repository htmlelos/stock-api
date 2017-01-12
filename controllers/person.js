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
// Obtener una persona
function findPerson(personId) {
    return Person.findById({_id: personId})
}
// Obtiene una persona por su id
function getPerson(request, response) {
    findPerson(request.params.personId)
        .then(person => {
            if (person) {
                message.success(response, 200, 'Persona obtenida con exito', person)
            } else {
                message.failure(response, 404, 'No se encontro la persona', null)
            }
        })
        .catch(error => {
            // console.error('--ERROR--', error);
            message.error(response, 422, 'No se pudo recuperar la persona', error)
        })
}

module.exports = {
    getAllPersons,
    createPerson,
    getPerson
}