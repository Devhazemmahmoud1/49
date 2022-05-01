const express = require('express')
const router = express.Router();
const guard = require('../middleware/guard')
const services = require('../controllers/servicesController')

router.get('/get-prices/:id', services.getSubCategoryPrices)

router.post('/submit-payment', guard, services.makeSubscriptionPayments);

router.post('/charge-balance', guard, services.chargeBalance)

router.post('/transfer-to', guard, services.transferTo)

router.post('/withdraw', guard , services.withdrawMoney)

router.get('/info', guard, services.userInfo)


module.exports = router