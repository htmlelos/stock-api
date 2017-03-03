'use strict';
// Esablecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Person = require('../models/person')
const settings = require('../settings.cfg')
// Dependencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)

// Bloque principal de las pruebas de usuarios
describe.only('PERSON: ', () => {
    let token = ''
    // Se ejecuta antes de cada test
    beforeEach(done => {
        let superUser = {
            username: 'super@mail.com',
            password: 'super'
        }

        chai.request(server)
            .post('/login')
            .send(superUser)
            .end((error, response) => {
                response.should.be.status(200)
                response.body.should.have.property('data')
                response.body.data.should.have.property('token')
                token = response.body.data.token
                // Test from here
                done()
            })
    })
    // Se ejecuta despues de cada test
    afterEach(done => {
        Person.remove({}, error => { })
        done()
    })
    // GET /persons - Obtener todas las personas
    describe('GET /persons', () => {
        it('deberia obtener todas las personas', done => {
            let person = {
                type: 'CLIENTE',
                firstName: 'Juan',
                lastName: 'Perez',
                address: [],
                tributaryCode: '202202231962',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '122022022319623',
                contacts: [],
                status: 'ACTIVO'
            }

            chai.request(server)
                .get('/persons')
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message').eql('')
                    response.body.should.have.property('data')
                    response.body.data.length.should.be.eql(0)
                    done()
                })
        })
    })
    // POST /person - Crea una persona
    describe('POST /person', () => {
        it('deberia crear una nueva persona (CLIENTE)', done => {
            let person = {
                type: 'CLIENTE',
                firstName: 'Juan',
                lastName: 'Perez',
                address: [],
                tributaryCode: '202202231962',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12202202231962',
                contacts: [],
                status: 'ACTIVO'
            }

            chai.request(server)
                .post('/person')
                .set('x-access-token', token)
                .send(person)
                .end((error, response) => {
                    response.body.should.be.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message').eql(`${person.type} creado con éxito`)
                    response.body.should.have.property('data')
                    response.body.data.should.have.property('id').to.be.not.null
                    done()
                })
        })
        it('no deberia crear una nueva persona sin tipo de persona', done => {
            let person = {
                firstName: 'Juan',
                lastName: 'Perez',
                address: [],
                tributaryCode: '20232021962',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '122022022319623',
                contacts: [],
                status: 'ACTIVO'
            }

            chai.request(server)
                .post('/person')
                .set('x-access-token', token)
                .send(person)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Tipo de persona no definido')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
        it('no deberia crear una person con tipo inválido', done => {
            let person = {
                type: 'COBRADOR',
                firstName: 'Pedro',
                lastName: 'Perez',
                address: [],
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '1220232021692',
                contacts: [],
                status: 'ACTIVO'
            }

            chai.request(server)
                .post('/person')
                .set('x-access-token', token)
                .send(person)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Tipo de persona no definido')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
        it('no deberia crear cliente persona sin nombre', done => {
            let person = {
                type: 'CLIENTE',
                lastName: 'Perez',
                address: [],
                tributaryCode: '202202231962',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12202202231962',
                contacts: [],
                status: 'ACTIVO'
            }

            chai.request(server)
                .post('/person')
                .set('x-access-token', token)
                .send(person)
                .end((error, response) => {
                    response.body.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                      .eql(`El nombre del ${person.type.toLowerCase()} esta vacio`)
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
        it('no deberia crear cliente persona sin apellido', done => {
            let person = {
                type: 'CLIENTE',
                firstName: 'Juan',
                address: [],
                tributaryCode: '202202231962',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '122022022319623',
                contacts: [],
                status: 'ACTIVO'
            }

            chai.request(server)
                .post('/person')
                .set('x-access-token', token)
                .send(person)
                .end((error, response) => {
                    response.body.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                      .eql(`El apellido del ${person.type.toLowerCase()} esta vacio`)
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
        it('no deberia crear un proveedor sin razon social', done => {
            let person = {
                type: 'PROVEEDOR',
                address: [],
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE NO INSCRIPTO',
                grossIncomeCode: '1220232021692',
                contacts: [],
                status: 'ACTIVO'
            }

            chai.request(server)
                .post('/person')
                .set('x-access-token', token)
                .send(person)
                .end((error, response) => {
                    response.body.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql(`La razón social del ${person.type.toLowerCase()} esta vacio`)
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
        it('El tipo de iva debe ser un valor válido', done => {
            let person = {
                type: 'CLIENTE',
                firstName: 'Juan',
                lastName: 'Perez',
                address: [],
                tributaryCode: '20232021962',
                taxStatus: 'IRRESPONSABLE INSCRIPTO',
                grossIncomeCode: '1220232021962',
                contacts: [],
                status: 'ACTIVO'
            }

            chai.request(server)
                .post('/person')
                .set('x-access-token', token)
                .send(person)
                .end((error, response) => {

                    response.body.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('El estado impositivo no es válido')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
        it('el estado de la persona solo puede ser ACTIVO o INACTIVO', done => {
            let person = {
                type: 'CLIENTE',
                firstName: 'Juan',
                lastName: 'Lopez',
                address: [],
                tributaryCode: '202202231962',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '122022022319623',
                contacts: [],
                status: 'HABILITADO'
            }

            chai.request(server)
                .post('/person')
                .set('x-access-token', token)
                .send(person)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                      .eql('El estado no es válido')
                    response.body.should.have.property('data').to.be.null
                    done()
                })

        })
        it('el cuit del proveedor no puede ser vacio', done => {
            let person = {
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                address: [],
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '1220232021692',
                contacts: [],
                status: 'ACTIVO'
            }

            chai.request(server)
                .post('/person')
                .set('x-access-token', token)
                .send(person)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('El CUIT no es válido')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
        it('el cuit del proveedor debe ser válido', done => {
            let person = {
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                address: [],
                tributaryCode: '20232021962',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '1220232021962',
                contacts: [],
                status: 'ACTIVO'
            }

            chai.request(server)
                .post('/person')
                .set('x-access-token', token)
                .send(person)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                      .equal('El CUIT no es válido')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
        it('el cuit del proveedor debe tener 11 caracteres', done => {
            let person = {
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                address: [],
                tributaryCode: '202320216921',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '1220232021692',
                contacts: [],
                status: 'ACTIVO'
            }

            chai.request(server)
                .post('/person')
                .set('x-access-token', token)
                .send(person)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('El CUIT no es válido')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
        it('el codigo de ingresos brutos del proveedor debe tener 13 caracteres', done => {
            let person = {
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                address: [],
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12202320216921',
                contacts: [],
                status: 'ACTIVO'
            }

            chai.request(server)
                .post('/person')
                .set('x-access-token', token)
                .send(person)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('El código de IIBB no es válido')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
    })
    // GET /person/:personId
    describe('GET /person/{personId}', () => {
        it('deberia obtener una persona por su id', done => {
            let person = new Person({
                type: 'CLIENTE',
                firstName: 'Juan',
                lastName: 'Perez',
                address: [],
                tributaryCode: '202202231962',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12202202231962',
                contacts: [],
                status: 'INACTIVO'
            });

            person.save()
                .catch(error => console.error('TEST:', error))

            chai.request(server)
                .get('/person/' + person._id)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Persona obtenida con éxito')
                    response.body.data.should.have.property('type')
                        .eql('CLIENTE')
                    response.body.data.should.have.property('firstName')
                        .eql('Juan')
                    response.body.data.should.have.property('lastName')
                        .eql('Perez')
                    response.body.data.should.have.property('addresses')
                    response.body.data.addresses.length.should.be.eql(0)
                    response.body.data.should.have.property('tributaryCode')
                        .eql('202202231962')
                    response.body.data.should.have.property('taxStatus')
                        .eql('RESPONSABLE INSCRIPTO');
                    response.body.data.should.have.property('grossIncomeCode')
                        .eql('12202202231962')
                    response.body.data.should.have.property('contacts')
                    response.body.data.contacts.length.should.be.eql(0)
                    response.body.data.should.have.property('status')
                        .eql('INACTIVO')
                    done();
                })
        })
        it('no deberia obtener una persona con id inválido', done => {
            let person = new Person({
                type: 'CLIENTE',
                firstName: 'Juan',
                lastName: 'Perez',
                address: [],
                tributaryCode: '202202231962',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12202202231962',
                contacts: [],
                status: 'INACTIVO'
            });

            person.save()
                .catch(error => console.error('TEST:', error))


            chai.request(server)
                .get('/person/58dece08eb0548118ce31f11')
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la persona')
                    response.body.should.have.property('data').to.be.null;
                    done();
                })
        })
    })
    // PUT /person/:personId - Actualiza una persona
    describe('PUT /person/{personId}', () => {
        it('deberia actualizar una persona por su id', done => {
            let person = new Person({
                type: 'CLIENTE',
                firstName: 'Juan',
                lastName: 'Perez',
                address: [],
                tributaryCode: '202202231962',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '122022022319623',
                contacts: [],
                status: 'INACTIVO'
            })

            person.save()
                .catch(error => console.error('TEST', error))


            chai.request(server)
                .put('/person/' + person._id)
                .set('x-access-token', token)
                .send({
                    status: 'ACTIVO'
                })
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Persona actualizada con éxito')
                    done()
                })
        })
        it('No deberia actualizar una persona con id inválido', done => {
            let person = new Person({
                type: 'CLIENTE',
                firstName: 'Juan',
                lastName: 'Perez',
                address: [],
                tributaryCode: '202202231962',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '122022022319623',
                contacts: [],
                status: 'INACTIVO'
            })

            person.save()
                .catch(error => console.error('TEST', error))

            chai.request(server)
                .put('/person/58dece08eb0548118ce31f11')
                .set('x-access-token', token)
                .send({
                    status: 'ACTIVO'
                })
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la persona')
                    done()
                })
        })
    })
    // DELETE /person/:personId
    describe('DELETE /person/{personId}', () => {
        it('deberia eliminar una persona por su id', done => {
            let person = new Person({
                type: 'CLIENTE',
                firstName: 'Juan',
                lastName: 'Perez',
                address: [],
                tributaryCode: '202202231962',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '122022022319623',
                contacts: [],
                status: 'ACTIVO'
            })

            person.save()
                .catch(error => console.error('TEST: ', error))

            chai.request(server)
                .delete('/person/' + person._id)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Persona eliminada con éxito')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
        it('no deberia eliminar una persona con un id de persona inválido', done => {
            let person = new Person({
                type: 'CLIENTE',
                firstName: 'Juan',
                lastName: 'Perez',
                address: [],
                tributaryCode: '202202231962',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '122022022319623',
                contacts: [],
                status: 'ACTIVO'
            })

            person.save()
                .catch(error => console.error('TEST: ', error))

            chai.request(server)
                .delete('/person/58dece08eb0548118ce31f11')
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la persona')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
    })
    // GET /person/:personId/contacts
    describe('GET /person/{personId}/contact', () => {
        it('deberia obtener todos los contactos de una persona', done => {
            let person = new Person({
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                address: [],
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE NO INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            person.save()
                .catch(error => console.error('TEST:', error))

            chai.request(server)
                .get('/person/' + person._id + '/contacts')
                .set('x-access-token', token)
                //.send(person)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Contactos obtenidos con éxito')
                    response.body.should.have.property('data')
                    response.body.data.length.should.be.eql(0)
                    done()
                })
        })
        it('no deberia obtener los contactos de una persona con id inválido', done => {
            let person = new Person({
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                address: [],
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE NO INSCRIPTO',
                grossIncomeCode: '120232021692',
                status: 'ACTIVO'
            })

            person.save()
                .catch(error => console.error('TEST:', error))

            chai.request(server)
                .get('/person/58dece08eb0548118ce31f11/contacts')
                .set('x-access-token', token)
                // .send(person)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la persona')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
    })
    // POST /person/:personId/contact
    describe('POST /person/{personId}/contact', () => {
        it('deberia crear un contacto para un persona por su id', done => {
            let person = new Person({
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                address: [],
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '1220232021692',
                status: 'ACTIVO'
            })

            person.save()
                .catch(error => console.error('TEST: ', error))

            let contact = {
                name: 'Cersei Lannister',
                phone: '555-777888'
            }

            chai.request(server)
                .post('/person/' + person._id + '/contact')
                .set('x-access-token', token)
                .send(contact)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Contacto añadido con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.be.a('array')
                    done()
                })
        })
        it('no deberia agregar un contacto para una person con id inválido', done => {
            let person = new Person({
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                address: [],
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '1220232021692',
                status: 'ACTIVO'
            })

            person.save()
                .catch(error => console.error('TEST: ', error))

            let contact = {
                name: 'Cersei Lannister',
                phone: '555-777888'
            }

            chai.request(server)
                .post('/person/58dece08eb0548118ce31f11/contact')
                .set('x-access-token', token)
                .send(contact)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la persona')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
    })
    // DELETE /person/:personId/contact
    describe('DELETE /person/{personId}/contact/{contactId}', () => {
        it('deberia eliminar un contacto de usuario por su id', done => {
            let person = new Person({
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                address: [],
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '1220232021692',
                status: 'ACTIVO'
            })

            let contact = {
                name: 'Cersei Lannister',
                phone: '555-777888'
            }

            person.contacts.push(contact)

            person.save()
                .catch(error => console.log('TEST: ', error))

            // console.log('::PERSONA::', person.contacts[0]._id);

            chai.request(server)
                .delete('/person/' + person._id + '/contact/' + person.contacts[0]._id)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Contacto eliminado con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.be.a('array')
                    done()
                })
        })
        it('no deberia eliminar un contacto de una persona con id inválido', done => {
            let superUser = {
                username: 'super@mail.com',
                password: 'super'
            }

            chai.request(server)
                .post('/login')
                .send(superUser)
                .end((error, response) => {
                    response.should.be.status(200)
                    response.body.should.have.property('data')
                    response.body.data.should.have.property('token')
                    token = response.body.data.token
                    // Test from here
                    let person = new Person({
                        type: 'PROVEEDOR',
                        bussinesName: 'La Estrella',
                        address: [],
                        tributaryCode: '20232021692',
                        taxStatus: 'RESPONSABLE INSCRIPTO',
                        grossIncomeCode: '1220232021692',
                        status: 'ACTIVO'
                    })

                    let contact = {
                        name: 'Cersei Lannister',
                        phone: '555-777888'
                    }

                    person.contacts.push(contact)

                    person.save()
                        .catch(error => console.log('TEST: ', error))

                    // console.log('::PERSONA::', person.contacts[0]._id);

                    chai.request(server)
                        .delete('/person/58dece08eb0548118ce31f11/contact/' + person.contacts[0]._id)
                        .set('x-access-token', token)
                        .end((error, response) => {
                            response.should.have.status(404)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message')
                                .eql('No se encontró la persona')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })
    })
    // DELETE /person/:personId/contacts
    describe('DELETE /person/{personId}/contacts', () => {
        it('deberia eliminar todos los contactos indicados', done => {
            let person = new Person({
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '1220232021692',
                status: 'ACTIVO'
            })
            let contacts = []

            let contact = { name: 'Cersei Lannister', phone: '555-777888' }
            person.contacts.push(contact)

            let contactId = person.contacts[0]._id
            contacts.push(contactId)

            contact = { name: 'Tirion Lannister', phone: '666-777889' }
            person.contacts.push(contact)

            contact = { name: 'Eddard Stark', phone: '666-777819' }
            person.contacts.push(contact)

            contactId = person.contacts[1]._id
            contacts.push(contactId)

            person.save()
                .catch(error => {
                    console.error('ERROR: ', error);
                })

            chai.request(server)
                .delete('/person/' + person._id + '/contacts')
                .set('x-access-token', token)
                .send({ contacts: JSON.stringify(contacts) })
                .end((error, response) => {
                    response.should.be.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Contactos eliminados con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.be.a('array')
                    done()
                })
        })
    })
    // GET /person/:personId/addresses
    describe('GET /person/{personId}/addresses', () => {
        it('deberia obtener todas las direcciones de una persona', done => {
            let person = new Person({
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                address: [],
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE NO INSCRIPTO',
                grossIncomeCode: '1220232021692',
                status: 'ACTIVO'
            })

            person.save()
                .catch(error => console.error('TEST: ', error))

            chai.request(server)
                .get('/person/' + person._id + '/addresses')
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Direcciones obtenidas con éxito')
                    response.body.should.have.property('data')
                    response.body.data.length.should.be.eql(0)
                    done()
                })
        })
        it('no deberia obtener la direccion de una persona con id inválido', done => {
            let person = new Person({
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12232021692',
                status: 'ACTIVO'
            })

            person.save()
                .catch(error => console.error('TEST: ', error))

            chai.request(server)
                .get('/person/58dece08eb0548118ce31f11/addresses')
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la persona')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
    })
    // POST /person/:personId/address
    describe('POST /person/{personId}/address', () => {
        it('deberia agregar una direccion a una persona por su id', done => {
            let person = new Person({
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '1220232021692',
                contacts: [],
                status: 'ACTIVO'
            })

            person.save()
                .catch(error => console.log('ERROR:', error))

            let address = {
                address: 'Colon 1020'
            }

            chai.request(server)
                .post('/person/' + person._id + '/address')
                .set('x-access-token', token)
                .send(address)
                .end((error, response) => {
                    response.should.be.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Direccion añadida con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.be.a('array')
                    done()
                })
        })
        it('no deberia agregar una direccion a una persona con id inválido', done => {
            let person = new Person({
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '1220232021692',
                contacts: [],
                status: 'ACTIVO'
            })

            person.save()
                .catch(error => console.log('ERROR:', error))

            let address = {
                address: 'Colon 1020'
            }

            chai.request(server)
                .post('/person/58dece08eb0548118ce31f11/address')
                .set('x-access-token', token)
                .send(address)
                .end((error, response) => {
                    response.should.be.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la persona')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
    })
    describe('DELETE /person/{personId}/address', () => {
        it('deberia eliminar una direccion de una persona por su id', done => {
            let person = new Person({
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '12202202231962',
                status: 'ACTIVO'
            })

            let address = {
                address: 'Mitre 741'
            }

            person.addresses.push(address)

            person.save()
                .catch(error => console.log('ERROR: ', error))

            chai.request(server)
                .delete('/person/' + person._id + '/address/' + person.addresses[0]._id)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.be.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Dirección eliminada con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.be.a('array')
                    done()
                })
        })
        it('no deberia eliminar una direccion de una persona con id inválido', done => {
            let person = new Person({
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                tributaryCode: '20232021692',
                taxtStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '122022022319623',
                status: 'ACTIVO'
            })

            let address = {
                address: 'Mitre 741'
            }

            person.addresses.push(address)

            person.save()
                .catch(error => console.log('ERROR: ', error))

            // console.log('::PERSONA::', person.addresses[0]._id);

            chai.request(server)
                .delete('/person/58dece08eb0548118ce31f11/address/' + person.addresses[0]._id)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.be.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la persona')
                    response.body.should.have.property('data').to.be.null
                    done()
                })
        })
    })
    describe('DELETE /person/{personId}/addresses', () => {
        it('deberia eliminar todas las direcciones indicadas', done => {
            let person = new Person({
                type: 'PROVEEDOR',
                bussinesName: 'La Estrella',
                tributaryCode: '20232021692',
                taxStatus: 'RESPONSABLE INSCRIPTO',
                grossIncomeCode: '1220232021692',
                status: 'ACTIVO'
            })
            let addresses = []

            let address = { address: 'Colon 1020' }
            person.addresses.push(address)

            let addressId = person.addresses[0]._id
            addresses.push(addressId)

            address = { address: 'Mitre 758' }
            person.addresses.push(address)

            addressId = person.addresses[1]._id
            addresses.push(addressId)

            person.save()
                .catch(error => {
                    console.error('ERROR: ', error);
                })

            chai.request(server)
                .delete('/person/' + person._id + '/addresses')
                .set('x-access-token', token)
                .send({ addresses: JSON.stringify(addresses) })
                .end((error, response) => {
                    response.should.be.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Direcciones eliminadas con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.be.a('array')
                    done()
                })
        })
    })
})