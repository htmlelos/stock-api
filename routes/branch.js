'use strict'

const Branch = require('../controllers/branch')
const router = require('express').Router()

router.route('/branchs')
    .get(Branch.getAllBranchs)
    .post(Branch.retrieveAllBranchs)

router.route('/branch')
    .post(Branch.createBranch)
    
router.route('/branch/:branchId')
    .get(Branch.getBranch)
    .put(Branch.updateBranch)
    .delete(Branch.deleteBranch)


module.exports = router