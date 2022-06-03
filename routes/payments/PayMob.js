const guard = require("../../middleware/guard");
const { autoCatch } = require("../../utils/auto_catch");
const { getPaymobToken, makeOrder, paymentKeys, getHMACByOrderId } = require('../../controllers/PaymentGateWayControllers/PayMobController')

const router = require('express').Router()

/* Get the token */
router.post('/transaction', guard, async (req, res, next) => {
    var { paymentInfo } = req.body

    let amount = (paymentInfo.amount * 100)
    var token = await getPaymobToken()
    //console.log(token)
    var orderId = await makeOrder(token, amount)
    //console.log(orderId)
    var paymentKey = await paymentKeys(token, orderId, amount, req.user.id, paymentInfo.subCategory_id)
    //console.log(paymentKey)
    return res.status(200).json({
        url: `https://accept.paymob.com/api/acceptance/iframes/354120?payment_token=${paymentKey}`

        
    })
})

router.post('/callback', async (req, res) => {
    const { hmac } = req.query
    const { id, success, payment_key_claims } = req.body.obj

    const paymentToken = await getPaymobToken()

    if (success == true && (await getHMACByOrderId(paymentToken, id)) == hmac) {
        return res.json(payment_key_claims)
    }

    res.send()

})

/* CallBack Route */
router.get('/callback', async (req, res) => {
    const { hmac, id } = req.query

    if (!hmac || !id || req.query.success == 'false') {
        return res.json({
            'stauts': false,
            'data': req.query['data.message'],
        })
    }

    const paymentToken = await getPaymobToken()

    const realHmac = await getHMACByOrderId(paymentToken, id)

    const isValid = realHmac == hmac

    res.redirect('http://64.225.101.68:3000/paymentstatus' + `?status=${isValid}`)
})

module.exports = router