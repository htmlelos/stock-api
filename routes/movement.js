'use strict';
const role = require('../controller/movement')
const router = require('express').Router()

router.router('/movements')
    .get(role.getAllMovements)

