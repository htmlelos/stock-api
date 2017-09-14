'use strict';
const mongoose = require('mongoose')
const User = require('../models/user')
const Person = require('../models/person')
const message = require('../services/response/message')

//Obtener todos los personas
function getAllPersons(request, response) {
    Person.find(request.query)
        .then(persons => {
            message.success(response, 200, '', persons)
        })
        .catch(error => {
            message.failure(response, 500, 'No se pudo recuperar las personas', error)
        })
}
// Recuperar todos las personas
function retrieveAllPerson(request, response) {
    let limit = parseInt(request.body.limit)
    let fields = request.body.fields
    let filter = request.body.filter
    let sort = request.body.sort

    Person.find(filter)
        .select(fields)
        .limit(limit)
        .sort(sort)
        .then(people => {
            message.success(response, 200, '', people)
        })
        .catch(error => {
            message.failure(response, 404, 'No se pudo encontrar las personas', error)
        })
}
// Verifica los datos obligatorios de la persona
function checkPerson(request) {
    // Verificar Persona
    let type = request.body.type
    request.checkBody('type', 'Tipo de persona no definido')
        .notEmpty()
        .isIn(['CLIENTE', 'PROVEEDOR', 'VENDEDOR', 'CAJERO', 'ORDENANTE'])
    request.checkBody('status', 'El estado no es válido')
        .isIn(['ACTIVO', 'INACTIVO'])
    request.checkBody('business', 'Debe indicar la empresa a la que pertenece la persona')
        .notEmpty()
}
// Verifica los datos del comprador
function checkCustomer(request) {
    // Verificar Cliente
    let type = request.body.type
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
function checkSupplier(request) {
    // Verificar Proveedor
    let type = request.body.type
    if (type === 'PROVEEDOR') {
        request.checkBody('businessName', `La razón social del ${type.toLowerCase()} esta vacio`)
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
function checkSeller(request) {
    // Verificar VENDEDOR
    let type = request.body.type
    if (type === 'VENDEDOR') {
        request.checkBody('firstName', `El nombre del ${type.toLowerCase()} esta vacio`)
            .notEmpty()
        request.checkBody('lastName', `El apellido del ${type.toLowerCase()} esta vacio`)
            .notEmpty()
        // request.checkBody('user', `Debe indicar el usuario del ${type.toLowerCase()}`)
        //     .notEmpty()
    }
}
// Verifica los datos del cajero
function checkCashier(request) {
    // Verificar CAJERO
    let type = request.body.type
    if (type === 'CAJERO') {
        request.checkBody('firstName', `El nombre del ${type.toLowerCase()} esta vacio`)
            .notEmpty()
        request.checkBody('lastName', `El apellido del ${type.toLowerCase()} esta vacio`)
            .notEmpty()
        // request.checkBody('user', `Debe indicar el usuario del ${type.toLowerCase()}`)
        //     .notEmpty()
    }
}
// Crea una nueva persona en la base de datos
function createPerson(request, response) {
    // Validamos los parametros para la creacion de tipos de personas    
    checkPerson(request)
    checkCustomer(request)
    checkSupplier(request)
    checkSeller(request)
    checkCashier(request)

    let person = request.body;
    request.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) {
                let messages = result.useFirstErrorOnly().array().map(x => x.msg).join(',')
                return Promise.reject({ code: 422, message: messages, data: null })
            }
            return Promise.resolve()
        })
        .then(() => {
            if (person.type !== 'PROVEEDOR') {
                let user = request.body.user;
                if (user !== null && user !== undefined) {
                    if (user.hasOwnProperty('username') && user.hasOwnProperty('password')) {
                        return User.findOne({ username: user.username })
                    } else {
                        return User.findById(user)
                    }
                } else {
                    let error = { code: 422, message: 'No se puede generar el usuario', data: null }
                    return Promise.reject(error)
                }
            }
            return Promise.resolve(null)
        })
        .then(user => {
            if (person.type !== 'PROVEEDOR') {
                if (user === null) {
                    let user = request.body.user
                    user.status = 'ACTIVO'
                    let newUser = new User(user);
                    return newUser.save()
                } else {
                    return User.findById(user)
                }
            }
            return Promise.resolve(null)
        })
        .then((user) => {
            let newPerson = new Person(request.body)
            if (user !== null) {
                newPerson.user = user._id;
            }
            newPerson.createdBy = request.decoded.username
            return newPerson.save()
        })
        .then(person => {
            message.success(response, 200, `${person.type} creado con éxito`, { id: person._id })
        })
        .catch(error => {
            if (error.code && error.code === 11000) {
                let error = { code: 422, message: 'La persona ya existe', data: null }
                message.failure(response, error.code, error.message, error.data)
            } else if (error.code) {
                message.failure(response, error.code, error.message, error.data)
            } else {
                message.failure(response, 500, error.message, error)
            }
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
    let personId = request.params.personId
    findPerson(personId)
        .then(person => {
            message.success(response, 200, 'Persona obtenida con éxito', person)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}
// Actualiza una persona
function updatePerson(request, response) {
    let personId = request.params.personId
    // Encuentra la persona a actualizar
    findPerson(personId)
        .then(person => {
            if (person) {
                let newPerson = request.body
                newPerson.username = request.decoded.username
                newPerson.updatedAt = Date.now()
                return Person.update({ _id: person._id }, { $set: newPerson }, { runValidators: true })
            } else {
                let error = { code: 404, message: 'No se encontró la persona', data: null }
                return Promise.reject(error)
            }
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
    let personId = request.params.personId
    findPerson(personId)
        .then(person => {
            if (person) {
                return Person.remove({ _id: person.id })
            } else {
                let error = { code: 404, message: 'No se encontró la persona', data: null }
                return Promise.reject(error)
            }
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
                    // let contactId = mongoose.Types.ObjectId(id)
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
    retrieveAllPerson,
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