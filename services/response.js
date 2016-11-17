const success = function (response, info) {
  console.log('--SUCCESS--');
  response.status(info.status||200).json(info)
}

const failure = function (response, info) {
  // console.log('--FAILURE--');
  response.status(info.status||404).json(info)
}

const duplicate = function (response, info) {
  response.status(info.status||422).json(info)
  response.end()
}
//
const error = function (response, info) {
  // console.log('--INFO--', info.data.errors);
  for(let property in info.data.errors) {
    // console.log('--PROPERTY--', info.data.errors[property].message);
    info.message = info.data.errors[property].message
  }
  // console.log('--INFO-MESSAGE--', info);
  info.data = null
  response.status(info.status).json(info)
}

module.exports = {
  success,
  failure,
  duplicate,
  error
}
