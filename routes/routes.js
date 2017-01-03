const common = require('./common')
const security = require('./security')
const role = require('./role')
const profile = require('./profile')
const user = require('./user')
const person = require('./person')
//const supplier = require('./supplier')
const brand = require('./brand')
const product = require('./product')
const document = require('./document')

module.exports = function routes(server) {
  server.use('/', common)
  server.use('/', security)
  server.use('/', role)
  server.use('/', profile)
  server.use('/', user)
  console.log('HERE - ROUTE');
  server.use('/', person)
  //server.use('/', supplier)
  server.use('/', brand)
  server.use('/', product)
  server.use('/', document)
}
