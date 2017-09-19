const success = function(response, status=200, message='', data) {
  return response.status(status).json({status, message, data})
}

const failure = function (response, status=404, message='', data) {
  return response.status(status).json({status, message, data})
}

module.exports = {
  success,
  failure,
}
