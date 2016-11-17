"use strict";
const profile = require('../controllers/profile')
const router = require('express').Router()

//GET /profiles - get all the profiles
//GET /profiles - obtener todos los perfiles
router.route('/profiles')
	.get(profile.getAllProfiles)
	// POST /profile - create a new profile
	// POST /profile - crea un nuevo perfil
router.route('/profile')
	.post(profile.createProfile)
	// GET /profile/:profile - get a profile by its profileId
router.route('/profile/:profileId')
	.get(profile.getProfile)
	.put(profile.updateProfile)
	.delete(profile.deleteProfile)

module.exports = router;
