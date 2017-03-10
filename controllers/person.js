'use strict';
const mongoose = require('mongoose')
const Person = require('../models/person')
const message = require('../services/response/message')

//Obtener todos los proveedores
function getAllPersons(request, response) {
    Person.find(request.query)
        .then(persons => {
            message.success(response, 200, '', persons)
        })
        .catch(error => {
            message.error(response, 500, 'No se pudo recuperar las personas', error)
        })
}
// Verifica los datos obligatorios de la persona
function checkPerson(request, type = null) {
    // Verificar Persona
    request.checkBody('type', 'Tipo de persona no definido')
        .notEmpty()
        .isIn(['CLIENTE', 'PROVEEDOR', 'VENDEDOR', 'CAJERO'])
    request.checkBody('status', 'El estado no es válido')
        .isIn(['ACTIVO', 'INACTIVO'])
}
// Verifica los datos del comprador
function checkCustomer(request, type) {
    // Verificar Cliente
    if (type === 'CLIENTE') {
        request.checkBody('firstName', `El nombre del ${type.toLowerCase()} esta vacio`)
            .notEmpty()
        request.checkBody('lastName', `El apellido del ${type.toLowerCase()} esta vacio`)
            .notEmpty()
        request.checkBody('taxStatus', 'El estado impositivo no es válido')
            .isIn(['RESPONSABLE INSCRIPTO', 'RESPONSABLE NO INSCRIPTO', 'MONOTRIBUTO', 'EXENTO'])
    }
}
// Verifica los datos del proveedor
function checkSupplier(request, type) {
    // Verificar Proveedor
    if (type === 'PROVEEDOR') {
        request.checkBody('bussinesName', `La razón social del ${type.toLowerCase()} esta vacio`)
            .notEmpty()
        request.checkBody('tributaryCode', 'El CUIT no es válido')
            .notEmpty()
            .isLength({ min: 11, max: 11 })
            .isCUIT()
        request.checkBody('grossIncomeCode', 'El código de IIBB no es válido')
            .notEmpty()
            .isLength({ min: 13, max: 13 })
    }
}
// Verifica los datos del vendedor
function checkSeller(request, type) {
    // Verificar VENDEDOR
    if (type === 'VENDEDOR') {
        request.checkBody('firstName', `El nombre del ${type.toLowerCase()} esta vacio`)
            .notEmpty()
        request.checkBody('lastName', `El apellido del ${type.toLowerCase()} esta vacio`)
            .notEmpty()
    }
}
// Verifica los datos del cajero
function checkCashier(request, type) {
    // Verificar CAJERO
    if (type === 'CAJERO') {
        request.checkBody('firstName', `El nombre del ${type.toLowerCase()} esta vacio`)
            .notEmpty()
        request.checkBody('lastName', `El apellido del ${type.toLowerCase()} esta vacio`)
            .notEmpty()
    }
}
// Crea una nueva persona en la base de datos
function createPerson(request, response) {
    // Validamos los parametros para la creacion de tipos de personas
    let type = request.body.type
    checkPerson(request)
    checkCustomer(request, type)
    checkSupplier(request, type)
    checkSeller(request, type)
    checkCashier(request, type)

    request.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) {
                let messages = result.useFirstErrorOnly().array().map(x => x.msg).join(',')
                return Promise.reject({ code: 422, messages, data: null })
            }
            return Promise.resolve()
        })
        .then(result => {
            let newPerson = new Person(request.body)
            newPerson.createdBy = request.decoded.username
            return newPerson.save()
        })
        .then(person => {
            message.success(response, 200, `${person.type} creado con éxito`, { id: person._id })
        })
        .catch(error => {
            message.failure(response, error.code, error.messages, error.data)
        })
}
// Obtener una persona
function findPerson(personId) {
    return new Promise((resolve, reject) => {
        Person.findById({ _id: personId })
            .then(person => {
                if (person) {
                    resolve(person)
                } else {
                    reject({ code: 404, message: 'No se encontró la persona', data: null })
                }
            })
            .catch(error => {
                reject({ code: 500, message: 'No se pudo obtener la persona', data: null })
            })
    })
}
// Obtiene una persona por su id
function getPerson(request, response) {
    findPerson(request.params.personId)
        .then(person => {
            message.success(response, 200, 'Persona obtenida con éxito', person)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}
// Actualiza una persona
function updatePerson(request, response) {
    // Encuentra la persona a actualizar
    findPerson(request.params.personId)
        .then(person => {
            let newPerson = request.body
            newPerson.username = request.decoded.username
            newPerson.updatedAt = Date.now()
            let personId = mongoose.Types.ObjectId(request.params.personId)
            return Person.update({ _id: personId }, { $set: newPerson }, { runValidators: true })
        })
        .then(person => {
            message.success(response, 200, 'Persona actualizada con éxito', null)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}
// Elimina una persona
function deletePerson(request, response) {
    findPerson(request.params.personId)
        .then(person => {
            return Person.remove({ _id: person.id })
        })
        .then(() => {
            message.success(response, 200, 'Persona eliminada con éxito', null)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}
// Obtiene todos los contactos de una persona
function getAllContacts(request, response) {
    findPerson(request.params.personId)
        .then(person => {
            let contacts = person.contacts
            message.success(response, 200, 'Contactos obtenidos con éxito', contacts)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}
// Añade un contacto a una persona
function addContact(request, response) {
    findPerson(request.params.personId)
        .then(person => {
            if (person) {
                let contact = request.body
                return Person.update({ _id: person._id }, { $push: { contacts: contact } })
            } else {
                return Promise.reject({ code: 404, message: 'No se encontró la persona', data: null })
            }
        })
        .then(() => {
            return findPerson(request.params.personId)
        })
        .then(person => {
            message.success(response, 200, 'Contacto añadido con éxito', person.contacts)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}
// Remueve un contacto de una persona
function removeContact(request, response) {
    findPerson(request.params.personId)
        .then(person => {
            if (person) {
                let contactId = request.params.contactId
                return Person.update({ _id: person._id }, { $pull: { contacts: { _id: contactId } } })
            } else {
                return Promise.reject({ code: 404, message: 'No se encontró la persona', data: null })
            }
        })
        .then(() => {
            return findPerson(request.params.personId)
        })
        .then(person => {
            message.success(response, 200, 'Contacto eliminado con éxito', person.contacts)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}
// Elimina los contactos indicados de una persona
function removeContacts(request, response) {
    findPerson(request.params.personId)
        .then(person => {
            if (person) {
                let contactsIds = JSON.parse(request.body.contacts)
                let personId = request.params.personId
                return Promise.all(contactsIds.map(id => {
                    let contactId = mongoose.Types.ObjectId(id)
                    return Person.update({ _id: personId }, { $pull: { 'contacts': { _id: id } } })
                }))
            } else {
                return Promise.reject({ code: 404, message: 'No se encontró la persona', data: null })
            }
        })
        .then(() => {
            return findPerson(request.params.personId)
        })
        .then(person => {
            message.success(response, 200, 'Contactos eliminados con éxito', person.contacts)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}
// Obtiene todas las direcciones de una persona
function getAllAddresses(request, response) {
    findPerson(request.params.personId)
        .then(person => {
            let addresses = person.addresses
            message.success(response, 200, 'Direcciones obtenidas con éxito', addresses)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}
// Añade una direccion a una persona
function addAddress(request, response) {
    findPerson(request.params.personId)
        .then(person => {
            if (person) {
                let address = request.body
                return Person.update({ _id: person._id }, { $push: { addresses: address } })
            } else {
                return Promise.reject({ code: 404, message: 'No se encontró' })
            }
        })
        .then(() => {
            return findPerson(request.params.personId)
        })
        .then(person => {
            message.success(response, 200, 'Direccion añadida con éxito', person.addresses)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}
// Elimina una direccion de una persona
function removeAddress(request, response) {
    findPerson(request.params.personId)
        .then(person => {
            if (person) {
                let addressId = request.params.addressId
                return Person.update({ _id: person._id }, { $pull: { addresses: { _id: addressId } } })
            } else {
                return Promise.reject({ code: 404, message: 'No se encontró la persona', data: null })
            }
        })
        .then(() => {
            return findPerson(request.params.personId)
        })
        .then(person => {
            message.success(response, 200, 'Dirección eliminada con éxito', person.addresses)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}
// Elimina las direcciones indicadas de una persona
function removeAddresses(request, response) {
    findPerson(request.params.personId)
        .then(person => {
            let addressesIds = JSON.parse(request.body.addresses)
            let personId = request.params.personId
            return Promise.all(addressesIds.map(id => {
                let addressId = mongoose.Types.ObjectId(id)
                return Person.update({ _id: personId }, { $pull: { addresses: { _id: addressId } } })
            }))
        })
        .then(() => {
            return findPerson(request.params.personId)
        })
        .then(person => {
            message.success(response, 200, 'Direcciones eliminadas con éxito', person.addresses)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

module.exports = {
    getAllPersons,
    createPerson,
    getPerson,
    updatePerson,
    deletePerson,
    getAllContacts,
    addContact,
    removeContact,
    removeContacts,
    getAllAddresses,
    addAddress,
    removeAddress,
    removeAddresses
}