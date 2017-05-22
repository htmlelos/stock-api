const success = function(response, status=200, message='', data) {
  return response.status(status).json({status, message, data})
}

const failure = function (response, status=404, message='', data) {
  return response.status(status).json({status, message, data})
}


// const duplicate = function (response, status=422, message='', data) {
//   return response.status(status).json({status, message, data})
// }

// const error = function (response, status=422, message='', data) {
//   if (data.code === 11000) {
//     return response.status(status).json({status, message, data})
//   } else {      
//       for(let property in data.errors) {
//         message = data.errors[property].message + ','
//       }
//       message = message.replace(/(^,)|(,$)/g, "")
//       data = null
//     return response.status(status).json({status, message, data})
//   }
// }

// const notAuthorized = function (response, status=401, message='', data) {
//   return response.status(status).json({status, message, data})
// }

module.exports = {
  success,
  failure,
  // duplicate,
  // error,
  // notAuthorized
}
