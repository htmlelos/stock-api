'use strict'

const branch = require('../controllers/branch')
const router = require('express').Router()

router.route('/branchs')
    .get(branch.getAllBranchs)
    .post(branch.retrieveAllBranchs)

router.route('/branch')
    .post(branch.createBranch)
    
router.route('/branch/:branchId')
    .get(branch.getBranch)
    .put(branch.updateBranch)
    .delete(branch.deleteBranch)

// router.route('/branch/:branchId/business')
//     .post(branch.addBusiness)

module.exports = router