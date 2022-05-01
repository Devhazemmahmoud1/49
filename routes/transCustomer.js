var router = require('express').Router()
const { route } = require('.');
var trans = require('../controllers/transportationController')
var guard = require('../middleware/guard')

/* THIS ROUTE FILE REPRESENTS EVERY SINGLE ROUTE FOR TRANSPORTATION */

/* Make a ride request */
router.post('/request-ride', guard, trans.makeRide);


router.get('/calculate-dis', trans.calculateDistance)

module.exports = router