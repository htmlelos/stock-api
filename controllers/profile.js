"user strict";
const Profile = require('../models/profile')
const message = require('../services/response/message')

//Obtener todos los perfiles
function getAllProfiles(request, response) {
	Profile.find({})
		.then(profile => {
			response.send(profile)
			response.end()
		})
		.catch(error => {
			response.send(error)
			response.end()
		})
}
//Crea un nuevo perfil
function createProfile(request, response) {
	// Create a profile instance with the parameters
	let newProfile = new Profile(request.body)

	newProfile.save()
		.then(profile => {
			response.json({ message: 'Perfil creado con éxito' })
			response.end()
		})
		.catch(error => {
			let message = ''
			if (error.code === 11000) {
				message = 'El perfil ya existe'
			} else {
				for (let property in error.errors) {
					if (error.errors.hasOwnProperty(property)) {
						message += error.errors[property].message + '<br>'
					}
				}
			}
			response.status(422).send({ message: message.replace(/(^,)|(,$)/g, "") })
			response.end()
		})
}
// Obtener un perfil
function findProfile(profileId) {
	return Profile.findById({ _id: profileId })
}
// Obtener un perfil por su profileId
function getProfile(request, response) {
	findProfile(request.params.profileId)
		.then(profile => {
			if (profile) {
				response.json({ message: 'Perfil obtenido con éxito', profile })
			} else {
				response.status(404).json({ message: 'No se encontró el perfil', profile })
			}
		})
		.catch(error => {
			response.send(error)
			response.end()
		})
}
//Actualiza un rol por su profileId
function updateProfile(request, response) {
	findProfile(request.params.profileId)
		.then(profile => {
			if (profile) {
				let newProfile = request.body
				newProfile.updateBy = require.decoded.username
				newProfile.updatedAt = Date.now()
				Profile.update({ _id: request.params.userId }, { $set: newProfile }, { runValidators: true })
					.then(profile => {
						response.json({ message: 'Perfil actualizado con éxito', profile })
					})
					.catch(error => {
						if (error.code === 11000) {
							response.status(422).send({ message: 'El perfil ya existe' })
						} else {
							response.send(error)
							response.end()
						}
					})
			} else {
				response.status(404)
					.send({ message: 'El perfil, no es un perfil válido' })
			}
		})
		.catch(error => {
			response.send(error)
			response.end()
		})
}

function deleteProfile(request, response) {
	findProfile(request.params.profileId)
		.then(profile => {
			if (profile) {
				Profile.remove({ _id: profile.id })
					.then(profile => {
						response.json({ message: 'Perfil eliminado con éxito' })
					})
					.catch(error => {
						response.send(error)
						response.end()
					})
			} else {
				response.status(404).json({ message: 'El perfil, no es un perfil válido' })
			}
		})
		.catch(error => {
			response.send(error)
			response.end()
		})
}

module.exports = {
	getAllProfiles,
	createProfile,
	getProfile,
	updateProfile,
	deleteProfile
}
