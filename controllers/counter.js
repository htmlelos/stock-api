'use strinct';
const Counter = require('../models/counter')
const message = require('../services/response/message')

// Obtener todos los contadores
const getAllCounters = (request, response) => {
    Counter.find({})
        .then(counters => {
            message.success(response, 200, '', counters)
        })
        .catch(error => {
            message.failure(response, 422, '', error)
        })
}
// Obtiene los contadores que cumplen con los criterios especificados
const retrieveAllCounters = (request, response) => {
    let limit = parseInt(request.body.limit)
    let fields = request.body.fields;
    let filter = request.body.filter;
    let sort = request.body.sort;

    Counter.find(filter)
        .select(fields)
        .limit(limit)
        .sort(sort)
        .then(counters => {
            message.success(response, 200, '', counters)
        })
        .catch(error => {
            message.failure(response, 404, 'No se recuperaron los contadores', error)
        })
}

const checkCounter = (request) => {
    request.checkBody('name', 'Debe indicar el nombre de la colección de datos')
        .notEmpty()
    request.checkBody('value', 'Debe indicar el valor del contador')
        .notEmpty()
}
// Crea un nuevo Contador
const createCounter = (request, response) => {
    checkCounter(request)

    request.getValidationResult()
        .then(result => {
            if (!result.isEmpty()) {
                let messages = result.useFirstErrorOnly().array().map(x => x.msg).join(',')
                return Promise.reject({ code: 422, message: messages, data: null })
            }
            return Promise.resolve()
        })
        .then(() => {
            let newCounter = new Counter(request.body)
            newCounter.createdBy = request.decoded.username
            return newCounter.save()
        })
        .then(counter => {
            message.success(response, 200, 'Contador creado con éxito', { id: counter._id })
        })
        .catch(error => {
            if (error.code && error.code === 11000) {
                let error = { code: 422, message: 'El Contador ya existe', data: null }
                message.failure(response, error.code, error.message, error.data)
            } else if (error.code) {
                message.failure(response, error.code, error.message, error.data)
            } else {
                message.failure(response, 500, error.message, null)
            }
        })
}
// Obtener un contador
const findCounter = (counterId) => {
    return Counter.findById({ _id: counterId })
}
// Obtener un contador por su counterId
const getCounter = (request, response) => {
    let counterId = request.params.counterId
    findCounter(counterId)
        .then(counter => {
            if (counter) {
                return Promise.resolve(counter)
            } else {
                let error = { code: 404, message: 'No se encontró el contador', data: null }
                return Promise.reject(error)
            }
        })
        .then(counter => {
            message.success(response, 200, 'Contador obtenido con éxito', counter)
        })
        .catch(error => {
            console.log('ERROR--', error);
            if (error.code) {
                message.failure(response, error.code, error.message, error.data)
            } else {
                message.failure(response, 500, 'No se pudo obtener el contador', error)
            }
        })
}

const modifyCounter = (counter, newCounter) => {
    if (counter) {
        return Counter.update({ _id: counter._id }, { $set: newCounter })
    } else {
        let error = { code: 404, message: 'El contador no es valido', data: null }
        return Promise.reject(error)
    }
}
// Actualizar un contador por su counterId
const updateCounter = (request, response) => {
    let counterId = request.params.counterId
    let newCounter = request.body
    newCounter.updatedBy = request.decoded.username
    newCounter.updatedAt = Date.now()
    findCounter(counterId)
        .then(counter => { return modifyCounter(counter, newCounter) })
        .then(() => { return findCounter(counterId) })
        .then(counter => { message.success(response, 200, 'Contador actualizado con éxito', counter) })
        .catch(error => {
            if (error.code && error.code === 11000) {
                let error = { code: 422, message: 'El Contador ya existe', data: null }
                message.failure(response, error.code, error.message, error.data)
            } else if (error.code) {
            } else {
                message.failure(response, 500, 'No se pudo recuperar el contador', null)
            }
        })
}
const removeCounter = (counter) => {
    if (counter) {
        return Counter.remove({ _id: counter.id })
    } else {
        let error = { code: 404, message: 'El contador no es valido', data: null }
        return Promise.reject(error)
    }
}
// Eliminar un contador por su counterID
const deleteCounter = (request, response) => {
    findCounter(request.params.counterId)
        .then(request.params.counterId)
        .then(counter => { return removeCounter(counter) })
        .then(() => { message.success(response, 200, 'Contador eliminado con éxito', null) })
        .catch(error => {
            if (error.code) {
                message.failure(response, error.code, error.message, error.data)
            } else {
                message.failure(response, 500, error.message, null)
            }
        })
}

const incrementCounter = (request, response) => {
    let counterId = request.params.counterId
    findCounter(counterId)
        .then(counter => {
            if (counter) {
                return Promise.resolve(counter)
            } else {
                let error = { code: 404, message: 'No se encontró el contador indicado', data: null }
                return Promise.reject(error)
            }
        })
        .then(counter => {
            console.log('COUNTER:--'.counter);
            let newCounter = {}
            newCounter.value = counter.value + counter.incrementBy
            console.log('NEW_COUNTER:--', newCounter)
            return modifyCounter(counter, newCounter)
        })
        .then(() => {
            return findCounter(counterId)
        })
        .then(counter => {
            message.success(response, 200, 'Contador incrementado con exito', counter)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

const currentCounter = (request, response) => {
    let counterId = request.params.counterId
    findCounter(counterId)
        .then(counter => {
            if (counter) {
                return Promise.resolve(counter)
            } else {
                let error = { code: 404, message: 'No se encontró el contador indicado', data: null }
                return Promise.reject(error)
            }
        })
        .then(counter => {
            message.success(response, 200, 'Contador obtenido con éxito', counter)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

const resetCounter = (request, response) => {
    let counterId = request.params.counterId
    findCounter(counterId)
        .then(counter => {
            if (counter) {
                return Promise.resolve(counter)
            } else {
                let error = {code: 404, message: 'No se encontró el contador indicado', data: null}
                return Promise.reject(error)                
            }
        })
        .then(counter => {
            console.log('COUNTER:--', counter)
            let newCounter = {}
            newCounter.value = 0
            console.log('NEW_COUNTER:--', newCounter)
            return modifyCounter(counter, newCounter)
        })
        .then(() => {
            return findCounter(counterId)
        })
        .then(counter => {
            message.success(response, 200, 'Contador reiniciado', counter)
        })
        .catch(error => {
            message.failure(response, error.code, error.message, error.data)
        })
}

module.exports = {
    getAllCounters,
    retrieveAllCounters,
    createCounter,
    getCounter,
    updateCounter,
    deleteCounter,
    incrementCounter,
    currentCounter,
    resetCounter
}