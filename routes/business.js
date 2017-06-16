'use strict';

const business = require('../controllers/business')
const router = require('express').Router()

router.route('/businesses')
    .get(business.getAllBusinesses)
    .post(business.retrieveAllBusinesses)

router.route('/business')
    .post(business.createBusiness)

router.route('/business/:businessId')
    .get(business.getBusiness)
    .put(business.updateBusiness)
    .delete(business.deleteBusiness)
    
router.route('/business/:businessId/branch')
    .post(business.addBranch)
    .delete(business.deleteBranch)

router.route('/business/:businessId/branchs')
    .delete(business.removeBranchs)
module.exports = router