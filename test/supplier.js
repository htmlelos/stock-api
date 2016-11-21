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
describe('SUPPLIER TEST SUITE', () => {
  beforeEach(done => {
    Supplier.remove({}, error => {
      done()
    })
  })

  describe('GET /suppliers', () => {
    it('deberia obtener todos los proveedores', done => {
      let user = {
        username: 'admin@mail.com',
        password: 'admin'
      }

      let token = jwt.sign(user, settings.secret, {expiresIn: '8h'})

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

  describe('POST /supplier', () => {
    it('deberia crear un nuevo proveedor', done => {
      let user = {
        username: 'admin@mail.com',
        password: 'admin'
      }

      let token = jwt.sign(user, settings.secret, {expiresIn: '8h'})

      let supplier = new Supplier({
        name: 'Distribuidora Oeste S.R.L',
        address: [{address: 'Julio A. Roca 2070', phone: '02664 442473', contact: 'Jorge Rodriguez'}],
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

    it('no deberia crear un proveedor sin nombre', done => {
      let user = {
        username: 'admin@mail.com',
        password: 'admin'
      }

      let token = jwt.sign(user, settings.secret, {expiresIn: '8h'})

      let supplier = new Supplier({
        address: [{address: 'Julio A. Roca 2070', phone: '02664 442473', contact: 'Jorge Rodriguez'}],
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

    it('no deberia crear un proveedor sin estado', done => {
      let user = {
        username: 'admin@mail.com',
        password: 'admin'
      }

      let token = jwt.sign(user, settings.secret, {expiresIn: '8h'})

      let supplier = new Supplier({
        name: 'Distribuidora Oeste S.R.L',
        address: [{address: 'Julio A. Roca 2070', phone: '02664 442473', contact: 'Jorge Rodriguez'}],
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

    it('el estado deberia ser ACTIVO o INACTIVO', done => {
      let user = {
        username: 'admin@mail.com',
        password: 'admin'
      }

      let token = jwt.sign(user, settings.secret, {expiresIn: '8h'})

      let supplier = new Supplier({
        name: 'Distribuidora Oeste S.R.L',
        address: [{address: 'Julio A. Roca 2070', phone: '02664 442473', contact: 'Jorge Rodriguez'}],
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

  describe('GET /supplier/:supplierId', () => {
    it('deberia rescuperar un proveedor por su id', done => {
      let user = {
        username: 'admin@mail.com',
        password: 'admin'
      }

      let token = jwt.sign(user, settings.secret, {expiresIn: '8h'})

      let supplier = new Supplier({
        name: 'Distribuidora Oeste S.R.L',
        address: [{address: 'Julio A. Roca 2070', phone: '02664 442473', contact: 'Jorge Rodriguez'}],
        status: 'ACTIVO'
      })

      supplier.save()
        .then(supplier => console.log())
        .catch(error => console.log('TEST', error))

      chai.request(server)
        .get('/supplier/' + supplier._id)
        .set('x-access-token', token)
        .send((error, response) => {
          console.log('::RESPONSE-BODY::', response.body);
          response.should.have.status(200)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
            .eql('Proveedor obtenido con exito')
          response.body.should.have.property('data')
          response.body.data.should.have.property('name')
            .eql('admin@mail.com')
          response.body.data.should.have.property('address')
          response.body.address.should.have.property('address')
            .eql('Julio A. Roca 2070')
          response.body.address.should.have.property('phone')
            .eql('02664 442473')
          response.body.address.should.have.property('contact')
            .eql('Jorge Rodriguez')
          response.body.data.should.have.property('status')
            .eql('ACTIVO')
          done()
        })
    })
  })
})
