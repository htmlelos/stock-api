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
    let newPerson = new Person(request.body)
    newPerson.save()
        .then(person => {
            message.success(response, 200, `${person.type} creado con exito`, { id: person._id })
        })
        .catch(error => {
            if (error.code === 11000) {
                message.error(response, 422, 'Persona ya existe', error)
            } else {
                message.error(response, 422, '', error)
            }
        })
}
// Obtener una persona
function findPerson(personId) {
    return Person.findById({ _id: personId })
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
            message.error(response, 422, 'No se pudo recuperar la persona', error)
        })
}
// Actualiza una persona
function updatePerson(request, response) {
    // Encuentra la persona a actualizar
    findPerson(request.params.personId)
        .then(person => {
            // Si la persona existe se actualiza con los datos proporcionados
            if (person) {
                let newPerson = request.body;
                newPerson.updatedBy = request.decoded.username
                newPerson.updatedAt = Date.now()
                Person.update({ _id: request.params.userId }, { $set: newPerson })
                    .then(person => {
                        message.success(response, 200, 'Persona actualizada con exito', null)
                    })
                    .catch(error => {
                        if (error.code === 11000) {
                            message.duplicate(response, 422, 'La persona ya existe', null)
                        } else {
                            message.error(response, 422, '', error)
                        }
                    })
            } else {
                message.failure(response, 404, 'La persona, no es una persona valida', null)
            }
        })
        .catch(error => { 
            message.error(response, 422, 'No se pudo actualizar la persona', error)
        })
}
// Elimina una persona
function deletePerson(request, response) {
    findPerson(request.params.personId)
        .then(person => {
            if (person) {
                Person.remove({_id: person.id})
                    .then(person => {
                        message.success(response, 200, 'Persona eliminada con exito', null)
                    })
                    .catch(error => {
                        message.error(response, 422, '', error)
                    })
            } else {
                message.failure(response, 404, 'La persona no es una persona valida', null)
            }
        })
        .catch(error => {
            message.error(response, 422, 'No se pudo eliminar la persona', error)
        })
}

function getAllContacts(request, response) {
    findPerson(request.params.personId)
        .then(person => {
            if(person) {
            message.success(response, 200, 'Contactos obtenidos con exito', person.contacts)
            } else {
                message.failure(response, 404, 'La Persona no es valida', null)
            }
        })
        .catch(error => {
            console.error('--ERROR--', error);
            message.error(response, 422, 'No se pudo recuperar los Contactos de la Persona', error)
        })
}

function addContact(request, response) {
    findPerson(request.params.personId)
        .then(person => {
            if (person) {
                let contact = request.body;
                // console.log('BODY--', contact);
                Person.update({_id: person._id}, { $addToSet: {contacts: contact}})
                    .then(result => {
                        message.success(response, 200, 'Contacto añadido con exito', 1)
                    })
                    .catch(error => {
                        message.error(422, 'No se pudo agregar el Contacto de la Persona', error)
                    })
            } else {
                message.failure(response, 404, 'La Persona no es valida', null)
            }
        })
        .catch(error => {
            console.error('--ERROR--', error)
            message.error(response, 422, 'No se pudo agregar el Contacto de la Persona', error)
        })
}

module.exports = {
    getAllPersons,
    createPerson,
    getPerson,
    updatePerson,
    deletePerson,
    getAllContacts,
    addContact
}