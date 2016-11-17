const success = function (response, info) {
  response.status(info.status||200).json(info)
}

const failure = function (response, info) {
  response.status(info.status||404).json(info)
}

const duplicate = function (response, info) {
  response.status(info.status||422).json(info)
  response.end()
}
//
const error = function (response, info) {
  for(let property in info.data.errors) {
    info.message = info.data.errors[property].message + ','
  }
  info.message = info.message.replace(/(^,)|(,$)/g, "")
  info.data = null
  response.status(info.status||422).json(info)
}

const notAuthorized = function (response, info) {
  response.status(info.status||401).json(info)
}

module.exports = {
  success,
  failure,
  duplicate,
  error
}
