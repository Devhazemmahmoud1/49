const express = require('express')
const router = express.Router();
const guard = require('../middleware/guard')
const services = require('../controllers/servicesController')
const {autoCatch} = require("../utils/auto_catch");

router.get('/get-prices/:id',autoCatch( services.getSubCategoryPrices))

router.post('/submit-payment', guard,autoCatch( services.makeSubscriptionPayments));

//router.post('/charge-balance', guard, services.chargeBalance)

//router.post('/transfer-to', guard, services.transferTo)

router.post('/withdraw', guard ,autoCatch( services.withdrawMoney))

router.post('/call-request', guard,autoCatch( services.callRequest))

router.get('/info', guard,autoCatch( services.userInfo))


module.exports = router