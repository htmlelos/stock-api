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

      let token = jwt.sign(user, settings.secret, {
        expiresIn: "8h"
      })

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