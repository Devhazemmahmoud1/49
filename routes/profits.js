const express = require('express')
const router = express.Router();
const profit = require('../controllers/profitsController')
const guard = require('../middleware/guard')

 /*  Routes for profit goes here  */

 /*  This Route is for calculating profit in 5 years and 10 years for this user  */
router.get('/profit-after5years', guard, profit.showMyInvestment)



module.exports = router