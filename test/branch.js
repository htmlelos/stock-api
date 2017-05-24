'use strict';
// Establecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Branch = require('../models/branch')
const settings = require('../settings')
// Dependencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)
// Bloque principal de pruebas de roles
describe.only('BRANCH: ', () => {
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
                done()
            })
    })
    // Se ejecuta despues de cada test
    afterEach(done => {
        Branch.remove({}, error => { })
        done()
    })
    // Obtener todas las sucursales
    describe('GET /branchs', () => {
        it('deberia obtener todas las sucursales', done => {
            chai.request(server)
                .get('/branchs')
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.be.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('')
                    response.body.should.have.property('data')
                    response.body.data.length.should.be.eql(0)
                    done()
                })
        })
    })
    // Obtiene las sucursales seleccionadas segun el criterio indicado
    describe('POST /branchs', () => {
        it('deberia obtener todas las sucursales', done => {
            let criteria = {
                limit: '',
                fields: '',
                filter: {},
                sort: {}
            }

            chai.request(server)
                .post('/branchs')
                .set('x-access-token', token)
                .send(criteria)
                .end((error, response) => {
                    response.should.be.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('')
                    done()
                })
        })

        it.skip('deberia obtener la cantidad de sucursales indicada', () => { })
        it.skip('deberia obtener los campos indicados de las sucursales', () => { })
        it.skip('deberia obtener las sucursales seleccionados', () => { })
        it.skip('deberia obtener las sucursales en el orden indicado', () => { })
    })
    // Agregar una nueva sucursal
    describe('POST /branch', () => {
        it('deberia crear una sucursal', done => {
            let branch = {
                name: 'Sucursal Maipu',
                address: {
                    province: 'San Luis',
                    city: 'San Luis',
                    street: 'Maipu'
                },
                status: 'ACTIVO'
            }

            chai.request(server)
                .post('/branch')
                .set('x-access-token', token)
                .send(branch)
                .end((error, response) => {
                    response.should.be.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Sucursal creada con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.be.a('object')
                    response.body.data.should.have.property('id')
                        .to.be.not.null
                    done()
                })
        })

        it('no deberia crear una sucursal sin nombre', done => {
            let branch = {
                address: {
                    province: 'San Luis',
                    city: 'San Luis',
                    street: 'Maipu'
                },
                status: 'ACTIVO'
            }

            chai.request(server)
                .post('/branch')
                .set('x-access-token', token)
                .send(branch)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Debe proporcionar el nombre de la sucursal')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

        it('no deberia crear una sucursal sin estado', done => {
            let branch = {
                name: 'Lavalle 868',
                address: {
                    province: 'San Luis',
                    city: 'San Luis',
                    street: 'Maipu'
                }
            }

            chai.request(server)
                .post('/branch')
                .set('x-access-token', token)
                .send(branch)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Debe definir el estado de la sucursal')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

        it('el estado de la sucursal solo puede ser ACTIVO o INACTIVO', done => {
            let branch = {
                name: 'Lavalle 868',
                address: {
                    province: 'San Luis',
                    city: 'San Luis',
                    street: 'Maipu'
                },
                status: 'SUSPENDIDO'
            }

            chai.request(server)
                .post('/branch')
                .set('x-access-token', token)
                .send(branch)
                .end((error, response) => {
                    response.should.be.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('El estado de la sucursal solo puede ser ACTIVO o INACTIVO')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

        it('no deberia crear una sucursal con nombre duplicado', done => {
            let branch = {
                name: 'Lavalle 868',
                address: {
                    province: 'San Luis',
                    city: 'San Luis',
                    street: 'Maipu'
                },
                status: 'ACTIVO'
            }

            let newBranch = new Branch(branch)
            newBranch.save()
                .catch(error => console.error('TEST:', error))

            chai.request(server)
                .post('/branch')
                .set('x-access-token', token)
                .send(branch)
                .end((error, response) => {
                    response.should.have.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('La sucursal ya existe')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })
    })
    // Obtener una sucursal
    describe('GET /branch/{branchId}', () => {
        it('deberia obtener una sucursal por su id', done => {
            let branch = new Branch({
                name: 'Maipu y Junin',
                address: {
                    province: 'San Luis',
                    city: 'San Luis',
                    street: 'Maipu'
                },
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => console.error('TEST:', error))

            chai.request(server)
                .get('/branch/' + branch._id)
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Sucursal obtenida con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.have.property('name')
                    response.body.data.should.have.property('address')
                    response.body.data.should.have.property('status')
                    done()
                })
        });

        it('no deberia obtener una sucursal con id invalido', done => {
            let branch = new Branch({
                name: 'Maipu y Junin',
                address: {
                    province: 'San Luis',
                    city: 'San Luis',
                    street: 'Maipu'
                },
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => console.error('TEST:', error))

            chai.request(server)
                .get('/branch/58dece08eb0548118ce31f11')
                .set('x-access-token', token)
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontro la sucursal')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })
    })
    // Actualizar una sucursal
    describe('PUT /branch/{branchId}', () => {
        it('deberia actualizar una sucursal por su id de rol', done => {
            let branch = new Branch({
                name: 'Lavalle 868',
                address: {
                    province: 'San Luis',
                    city: 'San Luis',
                    street: 'Maipu'
                },
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => console.error('TEST:', error))

            chai.request(server)
                .put('/branch/' + branch._id)
                .set('x-access-token', token)
                .send({
                    name: 'España y Maipu',
                    address: null,
                    status: 'ACTIVO'
                })
                .end((error, response) => {
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Sucursal actualizada con éxito')
                    response.body.should.have.property('data')
                    response.body.data.should.be.a('object')
                    done()
                })
        })

        it('no deberia actualizar una sucursal con un id de rol invalido', done => {
            let branch = new Branch({
                name: 'Lavalle 868',
                address: {
                    province: 'San Luis',
                    city: 'San Luis',
                    street: 'Maipu'
                },
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => console.error('TEST:', error))

            chai.request(server)
                .put('/branch/58dece08eb0548118ce31f11')
                .set('x-access-token', token)
                .send({
                    name: 'España y Maipu',
                    address: null,
                    status: 'ACTIVO'
                })
                .end((error, response) => {
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('No se encontró la sucursal')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

        it('no deberia actualizar una sucursal con nombre duplicado', done => {
            let branch = new Branch({
                name: 'Lavalle 868',
                address: {
                    province: 'San Luis',
                    city: 'San Luis',
                    street: 'Maipu'
                },
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => console.error('TEST:', error))

            branch = new Branch({
                name: 'Maipu y Junin',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => console.error('TEST:', error))

            chai.request(server)
                .put('/branch/' + branch._id)
                .set('x-access-token', token)
                .send({
                    name: 'Lavalle 868',
                    address: null,
                    status: 'ACTIVO'
                })
                .end((error, response) => {
                    response.should.have.status(422)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('La Sucursal ya existe')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })
    })
    // Eliminar una sucursal
    describe('DELETE /role/{roleId}', () => {
        it('debe eliminar un rol por su id', done => {
            let branch = new Branch({
                name: 'Lavalle 868',
                address: {
                    province: 'San Luis',
                    city: 'San Luis',
                    street: 'Maipu'
                },
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => console.error('TEST:', error))

            chai.request(server)
                .delete('/branch/' + branch._id)
                .set('x-access-token', token)
                .end((error, response) => {
                    // console.log('RESPONSE::', response.body);
                    response.should.have.status(200)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('Sucursal eliminada con éxito')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })

        it('no deberia eliminar un rol con un id de rol invalido', done => {
            let branch = new Branch({
                name: 'Lavalle 868',
                address: null,
                status: 'ACTIVO'
            })

            branch.save()
                .catch(error => console.error('TEST:', error))

            chai.request(server)
                .delete('/branch/58dece08eb0548118ce31f11')
                .set('x-access-token', token)
                .end((error, response) => {
                    // console.log('RESPONSE::', response.body)
                    response.should.have.status(404)
                    response.body.should.be.a('object')
                    response.body.should.have.property('message')
                        .eql('La Sucursal no es válida')
                    response.body.should.have.property('data')
                        .to.be.null
                    done()
                })
        })
    })

})