const common = require('./common')
const role = require('./role')
const profile = require('./profile')
const user = require('./user')

module.exports = function (service) {
  service.use('/', common)
  service.use('/', role)
  service.use('/', profile)
  service.use('/', user)
}
