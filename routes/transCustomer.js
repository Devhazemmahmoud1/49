var router = require('express').Router()
const { route } = require('.');
var trans = require('../controllers/transportationController')
var guard = require('../middleware/guard')
const {autoCatch} = require("../utils/auto_catch");

/* THIS ROUTE FILE REPRESENTS EVERY SINGLE ROUTE FOR TRANSPORTATION */

/* Make a ride request */
router.post('/request-ride', guard,autoCatch( trans.makeRide));


router.get('/calculate-dis',autoCatch( trans.calculateDistance))

module.exports = router