const axios = require('axios');

const apiKey = 'ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6VXhNaUo5LmV5SndjbTltYVd4bFgzQnJJam94TlRrME9EUXNJbU5zWVhOeklqb2lUV1Z5WTJoaGJuUWlMQ0p1WVcxbElqb2lhVzVwZEdsaGJDSjkuUFdpQTBBREs2Q3ZfbEVhNXN1TEJfdmdmbUNQa2RnVDlYczJuRnJabWJhR0dET3NsMkZSdlNKSG9Ec09TUHJySGJvbEVBMEpTMHZNUG4yYjZONXRfRVE='
const integrationId = '1837789'

async function getPaymobToken() {

    const result = await axios
        .post('https://accept.paymob.com/api/auth/tokens', {
            "api_key": apiKey
        })

    return result.data.token
}

async function makeOrder(token, amount) {

    const result = await axios
        .post('https://accept.paymob.com/api/ecommerce/orders', {
            "auth_token": token,
            "amount_cents": amount,
            "currency": "EGP",
        })
    return result.data.id // order id

}

async function paymentKeys(token, orderId, amount, userId, catId) {

    try {
        const result = await axios
        .post('https://accept.paymob.com/api/acceptance/payment_keys', {
            "auth_token": token,
            "amount_cents": amount, 
            "expiration": 3600, 
            "order_id": orderId,
            "billing_data": {
              "apartment": "803", 
              "email": "claudette09@exa.com", 
              "floor": catId.toString(), 
              "first_name": "Clifford", 
              "street": "Ethan Land", 
              "building": "8028", 
              "phone_number": "+86(8)9135210487", 
              "shipping_method": "PKG", 
              "postal_code": "01898", 
              "city": "Jaskolskiburgh", 
              "country": "CR", 
              "last_name": "Nicolas", 
              "state": userId.toString()
            }, 
            "currency": "EGP", 
            "integration_id": integrationId,
            "lock_order_when_paid": "false"
          })
          return result.data.token
    } catch (e) {
        cosnole.log('Somthing is wrong')
    }

}

async function getHMACByOrderId(token, orderId) {

    const result = await axios
        .get(`https://accept.paymobsolutions.com/api/acceptance/transactions/${orderId}/hmac_calc`,
            {
                headers:
                {
                    'Authorization': `Bearer ${token}`
                }
            }
        )
    return result.data.hmac
}


let transactionInfo =  async (req, res) => {

}

module.exports = {
    getPaymobToken,
    makeOrder,
    paymentKeys,
    getHMACByOrderId,
    transactionInfo
}