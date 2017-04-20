'use strict';

const user = require('../controllers/user')
const router = require('express').Router()
const passport = require('passport')  

// GET /users - obtener todos los Usuarios
// POST /users - obtener todos los usuarios que cumplan con los criterios especificados
router.route('/users')
	.get(user.getAllUsers)
	.post(user.retrieveAllUsers)
	// POST /user - crear un nuevo usuarios
router.route('/user')
	.post(user.createUser)
	// GET /user - obtener un usuario por su id
	// PUT /user - actualizar un nuevo usuario
router.route('/user/:userId')
	.get(user.getUser)
	.put(user.updateUser)
	.delete(user.deleteUser)

router.route('/user/:userId/roles')
  .get(user.getUserRoles)

router.route('/user/:userId/role')
	.post(user.addUserRole)

router.route('/user/:userId/role/:roleId')
  .delete(user.deleteUserRole)

module.exports = router
