const express = require('express')
const router = express.Router();
const guard = require('../middleware/guard')
const services = require('../controllers/servicesController')
const wallet = require('../controllers/walletController')
const {autoCatch} = require("../utils/auto_catch");

router.get('/get-prices/:id',autoCatch( services.getSubCategoryPrices))

router.post('/submit-payment', guard,autoCatch( services.makeSubscriptionPayments));

//router.post('/charge-balance', guard, services.chargeBalance)

//router.post('/transfer-to', guard, services.transferTo)

router.post('/withdraw', guard ,autoCatch( services.withdrawMoney))

router.post('/cashback-request', guard,autoCatch( services.makeRequest))

router.get('/info', guard,autoCatch( services.userInfo))

router.get('/get-wallet', guard, autoCatch( wallet.getWallet ))

//router.post('/make-request/to-some-ad', guard, autoCatch( services.makeRequest ))


module.exports = router