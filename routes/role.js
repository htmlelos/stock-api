'use strict';
const role = require('../controllers/role')
const router = require('express').Router()

//GET /roles - obtener todos los roles
router.route('/roles')
	.get(role.getAllRoles)
	.post(role.retrieveAllRoles)
	// POST /role - crea un nuevo rol
router.route('/role')
	.post(role.createRole)
	//GET /role/:roleId - obtener un rol por su roleId
	//PUT /role/:roleId - actualizar un rol por su roleId
	//DELETE /role/:roleId - eliminar un rol por su roleId
router.route('/role/:roleId')
	.get(role.getRole)
	.put(role.updateRole)
	.delete(role.deleteRole)

module.exports = router
