'use strict';
// Establecemos la variable de ambiente NODE_ENV a test
process.env.NODE_ENV = 'test'

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const Category = require('../models/category')
const settings = require('../settings.cfg')
// Dependencias de desarrollo
const chai = require('chai')
const chaiHttp = require('chai-http')
const server = require('../server')
const should = chai.should()

chai.use(chaiHttp)
// Blque principal de pruebas de categorías
describe.only('CATEGORY', () => {
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
  afterEach(done => {
    Category.remove({}, error => { })
    done()
  })
  // GET /categories - Obtener todos las categorías
  describe('GET /categories', () => {
    it('deberia obtener todas las categorías', done => {
      chai.request(server)
        .get('/categories')
        .set('x-access-token', token)
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
            .eql('')
          response.body.should.have.property('data')
          response.body.data.length.should.be.eql(0)
          done()
        })
    })
  })

  // POST /category - Crea una nueva categoría
  describe('POST /category', () => {
    it('deberia crear una nueva categoría', done => {

      let category = {
        name: 'Quesos',
        description: 'categorías de quesos',
        status: 'ACTIVO'
      }

      chai.request(server)
        .post('/category')
        .set('x-access-token', token)
        .send(category)
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
            .eql('categoría creada con éxito')
          response.body.should.have.property('data')
          response.body.data.should.have.property('id')
            .to.be.not.null
          done()
        })
    })

    it('no deberia crear una categoría sin nombres', done => {
      let category = {
        description: 'categorías de quesos',
        status: 'ACTIVO'
      }

      chai.request(server)
        .post('/category')
        .set('x-access-token', token)
        .send(category)
        .end((error, response) => {
          response.should.have.status(422)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
            .eql('Debe proporcionar un nombre de categoría')
          response.body.should.have.property('data').to.be.null
          done()
        })
    })

    it('no deberia crear una categoría sin nombres', done => {
      let category = {
        name: 'Quesos',
        status: 'ACTIVO'
      }

      chai.request(server)
        .post('/category')
        .set('x-access-token', token)
        .send(category)
        .end((error, response) => {
          response.should.have.status(422)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
            .eql('Debe proporcionar una description de la categoría')
          response.body.should.have.property('data').to.be.null
          done()
        })
    })

    it('es estado de la categoría deberia ser ACTIVO o INACTIVO', done => {
      let category = {
        name: 'Quesos',
        description: 'categorías de quesos',
        status: 'HABILITADO'
      }

      chai.request(server)
        .post('/category')
        .set('x-access-token', token)
        .send(category)
        .end((error, response) => {
          response.should.have.status(422)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
            .eql('El estado del rol solo puede ser ACTIVO o INACTIVO')
          response.body.should.have.property('data')
            .to.be.null
          done()
        })
    })
  })

  describe('GET /category/:categoryId', () => {
    it('deberia obtener una categoría por su id', done => {
      let category = new Category({
        name: 'Quesos',
        description: 'categorías de quesos',
        status: 'ACTIVO'
      })

      category.save()
        .catch(error => console.log(error))

      chai.request(server)
        .get('/category/' + category._id)
        .set('x-access-token', token)
        .end((error, response) => {
          // console.log('RESPONSE::', response.body)
          response.should.have.status(200)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
            .eql('categoría obtenida con éxito')
          response.body.should.have.property('data')
          response.body.data.should.have.property('_id')
            .to.be.not.null
          done()
        })
    })

    it('no deberia obtener una categoría id invalido', done => {
      let category = new Category({
        name: 'Quesos',
        description: 'categorías de quesos',
        status: 'ACTIVO'
      })

      category.save()
        .catch(error => console.log(error))

      chai.request(server)
        .get('/category/58dece08eb0548118ce31f11')
        .set('x-access-token', token)
        .end((error, response) => {
          // console.log('RESPONSE::', response.body)
          response.should.have.status(404)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
            .eql('No se encontro la categoría')
          response.body.should.have.property('data')
            .to.be.null
          done()
        })
    })
  })

  describe('PUT /category/categoryId', () => {
    it('deberia actualizar un producto por su id', done => {
      let category = new Category({
        name: 'Quesos',
        description: 'categorías de quesos',
        status: 'ACTIVO'
      })

      category.save()
        .catch(error => console.log(error))

      chai.request(server)
        .put('/category/' + category._id)
        .set('x-access-token', token)
        .send({
          name: 'Lacteos',
          description: 'categorías de Lacteos',
          status: 'ACTIVO'
        })
        .end((error, response) => {
          // console.log('RESPONSE::', response.body)
          response.should.have.status(200)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
            .eql('categoría actualizada con éxito')
          response.body.should.have.property('data')
          response.body.data.should.have.property('id')
            .to.be.not.null
          done()
        })
    })

    it('no deberia actualizar un producto con id invalido', done => {
      let category = new Category({
        name: 'Quesos',
        description: 'categorías de quesos',
        status: 'ACTIVO'
      })

      category.save()
        .catch(error => console.log(error))

      chai.request(server)
        .put('/category/58dece08eb0548118ce31f11')
        .set('x-access-token', token)
        .send({
          name: 'Lacteos',
          description: 'categorías de Lacteos',
          status: 'ACTIVO'
        })
        .end((error, response) => {
          // console.log('RESPONSE::', response.body)
          response.should.have.status(404)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
            .eql('No se encontró la categoría')
          response.body.should.have.property('data')
            .to.be.null
          done()
        })
    })

    it('no deberia actualizar a un nombre que ya existe', done => {
      let category = new Category({
        name: 'Quesos',
        description: 'categorías de quesos',
        status: 'ACTIVO'
      })

      category.save()
        .catch(error => console.log(error))

      category = new Category({
        name: 'Lacteos',
        description: 'categorías de Lacteos',
        status: 'ACTIVO'
      })

      category.save()
        .catch(error => console.log(error))

      chai.request(server)
        .put('/category/' + category._id)
        .set('x-access-token', token)
        .send({
          name: 'Quesos',
          description: 'categorías de Lacteos',
          status: 'ACTIVO'
        })
        .end((error, response) => {
          response.should.have.status(422)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
            .eql('La categoría ya existe')
          response.body.should.have.property('data')
            .to.be.null
          done()
        })
    })
  })

  describe('DELETE /category/:categoryId', () => {
    it('deberia eliminar una categoría por su id', done => {
      let category = new Category({
        name: 'Quesos',
        description: 'categorías de quesos',
        status: 'ACTIVO'
      })

      category.save()
        .catch(error => console.log(error))

      chai.request(server)
        .delete('/category/' + category._id)
        .set('x-access-token', token)
        .end((error, response) => {
          // console.log('RESPONSE::', response.body)
          response.should.have.status(200)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
            .eql('categoría eliminada con éxito')
          response.body.should.have.property('data')
            .to.be.null
          done()
        })
    })

    it('no deberia eliminar un producto con id invalido', done => {
      let category = new Category({
        name: 'Quesos',
        description: 'categorías de quesos',
        status: 'ACTIVO'
      })

      category.save()
        .catch(error => console.log(error))

      chai.request(server)
        .delete('/category/58dece08eb0548118ce31f11')
        .set('x-access-token', token)
        .end((error, response) => {
          // console.log('RESPONSE::', response.body)
          response.should.have.status(404)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
            .eql('La categoría no es válida')
          response.body.should.have.property('data')
            .to.be.null
          done()
        })
    })
  })

  describe('GET /category/:categoryId/categories', () => {
    it('Deberia obtener las subcategorías de una categoría por su id', done => {
      let parentCategory = new Category({
        name: 'Bebidas',
        description: 'Liquidos que se pueden ingerir',
        status: 'ACTIVO'
      })

      parentCategory.save()
        .catch(error => console.log('ERROR::', error))

      chai.request(server)
        .get('/category/' + parentCategory._id + '/categories')
        .set('x-access-token', token)
        .end((error, response) => {
          response.should.have.status(200)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
            .eql('Subcategorías obtenidas con éxito')
          response.body.should.have.property('data')
          response.body.data.length.should.be.eql(0)
          done()
        })
    })

    it('No deberia obtener las subcategorías de una categoría con id invalido', done => {
      let parentCategory = new Category({
        name: 'Bebidas',
        description: 'Liquidos que se pueden ingerir',
        status: 'ACTIVO'
      })

      parentCategory.save()
        .catch(error => console.log('ERROR::', error))

      chai.request(server)
        .get('/category/58dece08eb0548118ce31f11/categories')
        .set('x-access-token', token)
        .end((error, response) => {
          response.should.have.status(404)
          response.body.should.be.a('object')
          response.body.should.have.property('message')
            .eql('No se encontró la categoría')
          response.body.should.have.property('data')
            .to.be.null
          done()
        })
    })
  })

  describe.only('POST /category/:categoryId/category', () => {
    it('deberia agregar una subcategoría a una categoría', done => {
      let parentCategory = new Category({
        name: 'Lacteos',
        description: 'Productos lacteos',
        status: 'ACTIVO'
      })

      parentCategory.save()
        .catch(error => console.log('ERROR::', console.error(error)))

      chai.request(server)
        post('/category/')
    })    
  })

  describe.skip('DELETE /category/:categoryId', () => {
    it('deberia eliminar las categorías seleccionadas', done => {
      let category = new Category()
    })
  })
})