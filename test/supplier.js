'use strict';
// Establecemos la variable de ambien NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Supplier = require('../models/supplier')
const settings = require('../settings.cfg')
// Dependencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)
// Bloque principar de las pruebas de proveedores
describe('SUPPLIER: test suite', () => {
    let token = ''
    beforeEach(done => {
        //Supplier.remove({}, error => {})
        done()
    })
    afterEach(done => {
        Supplier.remove({}, error=> {})
        done()
    })
    // GET /suppliers- Obtener todos los proveedores
    describe('GET /suppliers', () => {
        it('deberia obtener todos los proveedores', done => {
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

                    chai.request(server)
                        .get('/suppliers')
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
    // POST /supplier - crea un nuevo proveedor
    describe('POST /supplier', () => {
        it('deberia crear un nuevo proveedor', done => {
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
                    let supplier = new Supplier({
                        name: 'Distribuidora Oeste S.R.L',
                        addresses: [{ address: 'Julio A. Roca 2070', phone: '02664 442473', contact: 'Jorge Rodriguez' }],
                        status: 'ACTIVO'
                    })

                    chai.request(server)
                        .post('/supplier')
                        .set('x-access-token', token)
                        .send(supplier)
                        .end((error, response) => {
                            response.should.have.status(200)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message').eql('Proveedor creado con exito')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it('no deberia crear un proveedor sin nombre', done => {
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
                    let supplier = new Supplier({
                        addresses: [{ address: 'Julio A. Roca 2070', phone: '02664 442473', contact: 'Jorge Rodriguez' }],
                        status: 'ACTIVO'
                    })

                    chai.request(server)
                        .post('/supplier')
                        .set('x-access-token', token)
                        .send(supplier)
                        .end((error, response) => {
                            response.should.have.status(422)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message').eql('Debe proporcionar un nombre para el proveedor')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it('no deberia crear un proveedor sin estado', done => {
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
                    let supplier = new Supplier({
                        name: 'Distribuidora Oeste S.R.L',
                        addresses: [{ address: 'Julio A. Roca 2070', phone: '02664 442473', contact: 'Jorge Rodriguez' }],
                    })

                    chai.request(server)
                        .post('/supplier')
                        .set('x-access-token', token)
                        .send(supplier)
                        .end((error, response) => {
                            response.should.have.status(422)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message').eql('Debe definir el estado del proveedor')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it('el estado deberia ser ACTIVO o INACTIVO', done => {
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
                    let supplier = new Supplier({
                        name: 'Distribuidora Oeste S.R.L',
                        addresses: [{ address: 'Julio A. Roca 2070', phone: '02664 442473', contact: 'Jorge Rodriguez' }],
                        status: 'HABILITADO'
                    })

                    chai.request(server)
                        .post('/supplier')
                        .set('x-access-token', token)
                        .send(supplier)
                        .end((error, response) => {
                            response.should.have.status(422)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message').eql('El estado del proveedor solo puede ser ACTIVO o INACTIVO')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })
    })
    // GET /supplier/:supplierId - obtiene un proveedor por su id
    describe('GET /supplier/:supplierId', () => {
        it('deberia obtener un proveedor por su id', done => {
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
                    let supplier = new Supplier({
                        name: 'Distribuidora del Oeste S.R.L.',
                        addresses: [{ address: 'Julio A. Roca 2070', phone: '02664 442473', contact: 'Jorge Rodriguez' }],
                        status: 'ACTIVO'
                    })

                    supplier.save()
                        .then(user => console.log())
                        .catch(error => console.error('TEST:', error))

                    chai.request(server)
                        .get('/supplier/' + supplier._id)
                        .set('x-access-token', token)
                        .end((error, response) => {
                            response.should.have.status(200)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message')
                                .eql('Proveedor obtenido con exito')
                            response.body.should.have.property('data')
                            response.body.data.should.have.property('name')
                                .eql('Distribuidora del Oeste S.R.L.')
                            response.body.data.should.have.property('status')
                                .eql('ACTIVO')
                            done()
                        })
                })
        })

        it('no deberia obtener un proveedor con id de proveedor invalido', done => {
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
                    let supplier = new Supplier({
                        name: 'Distribuidora del Oeste S.R.L.',
                        addresses: [{ address: 'Julio A. Roca 2070', phone: '02664 442473', contact: 'Jorge Rodriguez' }],
                        status: 'ACTIVO'
                    })

                    supplier.save()
                        .then(user => console.log())
                        .catch(error => console.error('TEST:', error))

                    chai.request(server)
                        .get('/supplier/58dece08eb0548118ce31f11')
                        .set('x-access-token', token)
                        .end((error, response) => {
                            response.should.have.status(404)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message')
                                .eql('No se encontro el proveedor')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })
    })
    // PUT /supplier/:supplierId
    describe('PUT /supplier/:supplierId', () => {
        it('deberia actualizar un proveedor por su id de proveedor', done => {
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
                    let supplier = new Supplier({
                        name: 'Distribuidora del Oeste S.R.L.',
                        addresses: [{ address: 'Julio A. Roca 2070', phone: '02664 442473', contact: 'Jorge Rodriguez' }],
                        status: 'ACTIVO'
                    })

                    supplier.save()
                        .then(user => console.log())
                        .catch(error => console.error('TEST:', error))

                    chai.request(server)
                        .put('/supplier/' + supplier._id)
                        .set('x-access-token', token)
                        .send({
                            name: 'Distribuidora del Atlantico S.A.',
                            addresses: [{ address: 'Julio A. Roca 2050' }],
                            contacts: [{ phone: '02664 442473', contact: 'Jorge Rodriguez' }],
                            status: 'INACTIVO'
                        })
                        .end((error, response) => {
                            response.should.have.status(200)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message')
                                .eql('Proveedor actualizado con exito')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it('no deberia actualizar un proveedor con id de proveedor invalido', done => {
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
                    let supplier = new Supplier({
                        name: 'Distribuidora del Oeste S.R.L.',
                        addresses: [{ address: 'Julio A. Roca 2070', phone: '02664 442473', contact: 'Jorge Rodriguez' }],
                        status: 'ACTIVO'
                    })

                    supplier.save()
                        .then(user => console.log())
                        .catch(error => console.error('TEST:', error))

                    chai.request(server)
                        .put('/supplier/58dece08eb0548118ce31f11')
                        .set('x-access-token', token)
                        .send({
                            name: 'Distribuidora del Atlantico S.A.',
                            addresses: [{ address: 'Julio A. Roca 2050', phone: '02664 442473', contact: 'Jorge Rodriguez' }],
                            status: 'INACTIVO'
                        })
                        .end((error, response) => {
                            response.should.have.status(404)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message')
                                .eql('El proveedor, no es un proveedor valido')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })
    })
    // DELETE /supplier/:supplierId 
    describe('DELETE /supplier/:supplierId', () => {
        it('deberia eliminar un proveedor por su id', done => {
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
                    let supplier = new Supplier({
                        name: 'Distribuidora del Oeste S.R.L.',
                        addresses: [{ address: 'Julio A. Roca 2070', phone: '02664 442473', contact: 'Jorge Rodriguez' }],
                        status: 'ACTIVO'
                    })

                    supplier.save()
                        .then(user => console.log())
                        .catch(error => console.error('TEST:', error))

                    chai.request(server)
                        .delete('/supplier/' + supplier._id)
                        .set('x-access-token', token)
                        .end((error, response) => {
                            response.should.have.status(200)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message')
                                .eql('Proveedor eliminado con exito')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })

        it('no deberia eliminar un proveedor con un id de proveedor invalido', done => {
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
                    let supplier = new Supplier({
                        name: 'Distribuidora del Oeste S.R.L.',
                        addresses: [{ address: 'Julio A. Roca 2070', phone: '02664 442473', contact: 'Jorge Rodriguez' }],
                        status: 'ACTIVO'
                    })

                    supplier.save()
                        .then(user => console.log())
                        .catch(error => console.error('TEST:', error))

                    chai.request(server)
                        .delete('/supplier/58dece08eb0548118ce31f11')
                        .set('x-access-token', token)
                        .end((error, response) => {
                            response.should.have.status(404)
                            response.body.should.be.a('object')
                            response.body.should.have.property('message')
                                .eql('El proveedor, no es un proveedor valido')
                            response.body.should.have.property('data').to.be.null
                            done()
                        })
                })
        })
    })
})
