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
describe('PERSON: test suite', () => {
    let token = ''
    // Se ejecuta antes de cada test
    beforeEach(done => {
        done()
    })
    // Se ejecuta despues de cada test
    afterEach(done => {
        Person.remove({}, error => { })
        done()
    })
    // GET /persons - Obtener todas las personas
    describe('GET /persons', () => {
        it('deberia obtener todas las personas', done => {
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
    })
    // POST /person - Crea una persona
    describe('POST /person', () => {
        it('deberia crear una nueva persona', done => {
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
                            response.body.should.have.property('message').eql(`${person.type} creado con exito`)
                            response.body.should.have.property('data')
                            response.body.data.should.have.property('id').to.be.not.null
                            done()
                        })
                })
        })

        it('no deberia crear una nueva persona sin tipo de persona', done => {
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
                    let person = {
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
                        .post('/person')
                        .set('x-access-token', token)
                        .send(person)
                        .end((error, response) => {

                            response.should.be.status(422)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message')
                                .eql('Debe proporcionar un tipo de persona')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it.skip('no deberia crear una nueva persona sin nombre', done => {
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
                                .eql('Debe proporcionar el nombre de la persona')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it.skip('no deberia crear una nueva persona sin apellido', done => {
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
                                .eql('Debe proporcionar el apellido de la persona')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it.skip('si el tipo de persona es PROVEEDOR no debe crear uno sin razon social', done => { })

        it('El tipo de iva debe ser un valor valido', done => {
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
                    let person = {
                        type: 'CLIENTE',
                        firstName: 'Juan',
                        lastName: 'Perez',
                        address: [],
                        tributaryCode: '202202231962',
                        taxStatus: 'IRRESPONSABLE INSCRIPTO',
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
                                .eql('El estado de la persona solo puede ser RESPONSABLE INSCRIPTO, RESPONSABLE NO INSCRIPTO, MONOTRIBUTO o EXENTO')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it('el tipo de persona debe ser un tipo valido', done => {
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
                    let person = {
                        type: 'DESARROLLADOR',
                        firstName: 'Juan',
                        lastName: 'Perez',
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

                            response.body.should.be.status(422)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message')
                                .eql('El tipo de persona solo puede ser o CLIENTE, PROVEEDOR, VENDEDOR o CAJERO')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it('el estado de la persona solo puede ser ACTIVO o INACTIVO', done => {
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
                    let person = {
                        type: 'CLIENTE',
                        firstName: 'Juan',
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
                                .eql('El estado de la persona solo puede ser ACTIVO o INACTIVO')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it.skip('el codigo tributario debe ser valido', done => { })
        it.skip('el codigo tributario debe tener x caracteres', done => { })
        it.skip('el codigo de ingresos brutos debe tener x caracteres', done => { })
        it.skip('si la persona es tipo PROVEEDOR debe proporcionar el cuit', done => { })
    })
    // GET /person/:personId
    describe('GET /person/{personId}', () => {
        it('deberia obtener una persona por su id', done => {
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
                                .eql('Persona obtenida con exito')
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
        })

        it('no deberia obtener una persona con id invalido', done => {
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
                                .eql('No se encontro la persona')
                            response.body.should.have.property('data').to.be.null;
                            done();
                        })
                })
        })
    })
    // PUT /person/:personId
    describe('PUT /person/{personId}', () => {
        it('deberia actualizar una persona por su id', done => {
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
                                .eql('Persona actualizada con exito')
                            done()
                        })
                })
        })

        it('No deberia actualizar una persona con id invalido', done => {
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
                                .eql('La persona, no es una persona valida')
                            done()
                        })
                })
        })
    })
    // DELETE /person/:personId
    describe('DELETE /person/{personId}', () => {
        it('deberia eliminar una persona por su id', done => {
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
                                .eql('Persona eliminada con exito')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it('no deberia eliminar una persona con un id de persona invalido', done => {
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
                                .eql('La persona no es una persona valida')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })
    })
    // GET /person/:personId/contacts
    describe('GET /person/{personId}/contact', () => {
        it('deberia obtener todos los contactos de una persona', done => {
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
                        firstName: 'Jane',
                        lastName: 'Jetson',
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
                                .eql('Contactos obtenidos con exito')
                            response.body.should.have.property('data')
                            response.body.data.length.should.be.eql(0)
                            done()
                        })
                })
        })

        it('no deberia obtener los contactos de una persona con id invalido', done => {
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
                        firstName: 'Jane',
                        lastName: 'Jetson',
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
                                .eql('La Persona no es valida')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })
    })
    // POST /person/:personId/contact
    describe('POST /person/{personId}/contact', () => {
        it('deberia crear un contacto para un persona por su id', done => {
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
                        firstName: 'Tirion',
                        lastName: 'Lannister',
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
                                .eql('Contacto añadido con exito')
                            response.body.should.have.property('data').to.be.not.null
                            done()
                        })
                })
        })

        it('no deberia agregar un contacto para una person con id invalido', done => {
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
                        firstName: 'Tirion',
                        lastName: 'Lannister',
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
                                .eql('La Persona no es valida')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })
    })
    // DELETE /person/:personId/contact/
    describe('DELETE /person/{personId}/contact/{contactId}', () => {
        it('deberia eliminar un contacto de usuario por su id', done => {
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
                        firstName: 'Tirion',
                        lastName: 'Lannister',
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
                                .eql('Contacto eliminado con exito')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it('no deberia eliminar un contacto de una persona con id invalido', done => {
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
                        firstName: 'Tirion',
                        lastName: 'Lannister',
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
                                .eql('Persona no es valida')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it('no deberia eliminar un contacto con id invalido de una persona', done => {
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
                        firstName: 'Tirion',
                        lastName: 'Lannister',
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
                        .delete('/person/' + person._id + '/contact/58dece08eb0548118ce31f11')
                        .set('x-access-token', token)
                        .end((error, response) => {
                            response.should.have.status(404)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message')
                                .eql('Contacto no es valido')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })
    })

    // GET /person/:personId/addresses
    describe('GET /person/{personId}/addresses', () => {
        it('deberia obtener todas las direcciones de una persona', done => {
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
                        firstName: 'Eddard',
                        lastName: 'Stark',
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
                                .eql('Direcciones obtenidas con exito')
                            response.body.should.have.property('data')
                            response.body.data.length.should.be.eql(0)
                            done()
                        })

                })
        })

        it('no deberia obtener la direccion de una persona con id invalido', done => {
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
                        firstName: 'Juan',
                        lastName: 'Tronco',
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
                                .eql('Persona no es valida')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })
    })
    // POST /person/:personId/address
    describe('POST /person/{personId}/address', () => {
        it('deberia agregar una direccion a una persona por su id', done => {
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
                        firstName: 'Aria',
                        lastName: 'Stark',
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
                                .eql('Direccion agregada con exito')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it('no deberia agregar una direccion a una persona con id invalido', done => {
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
                        firstName: 'Aria',
                        lastName: 'Stark',
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
                                .eql('Persona no es valida')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })
    })

    describe('DELETE /person/{personId}/address', () => {
        it('deberia eliminar una direccion de una persona por su id', done => {
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
                        firstName: 'Jon',
                        lastName: 'Stark',
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

                    // console.log('::PERSONA::', person.addresses[0]._id);

                    chai.request(server)
                        .delete('/person/' + person._id + '/address/' + person.addresses[0]._id)
                        .set('x-access-token', token)
                        .end((error, response) => {
                            response.should.be.status(200)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message')
                                .eql('Dirección eliminada con exito')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it('no deberia eliminar una direccion de una persona con id invalido', done => {
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
                        firstName: 'Jon',
                        lastName: 'Stark',
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
                                .eql('Persona no valida')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it('no deberia eliminar una direccion con id invalido', done => {
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
                        firstName: 'Jon',
                        lastName: 'Stark',
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
                        .delete('/person/' + person._id + '/address/58dece08eb0548118ce31f11')
                        .set('x-access-token', token)
                        .end((error, response) => {
                            response.should.be.status(404)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message')
                                .eql('Dirección no valida')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })
    })

    describe.only('DELETE /person/{personId}/addresses', () => {
        it('deberia eliminar todas las direcciones indicadas', done => {
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
                        firstName: 'Jon',
                        lastName: 'Snow',
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
                        .send(addresses)
                        .end((error, response) => {
                            console.log('RESPONSE::', response.body)
                            response.should.be.status(200)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message')
                                .eql('Direcciones eliminadas con exito')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })
    })
})