const axios = require('axios');
const apiKey = 'ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6VXhNaUo5LmV5SndjbTltYVd4bFgzQnJJam94TlRrME9EUXNJbU5zWVhOeklqb2lUV1Z5WTJoaGJuUWlMQ0p1WVcxbElqb2lhVzVwZEdsaGJDSjkuUFdpQTBBREs2Q3ZfbEVhNXN1TEJfdmdmbUNQa2RnVDlYczJuRnJabWJhR0dET3NsMkZSdlNKSG9Ec09TUHJySGJvbEVBMEpTMHZNUG4yYjZONXRfRVE='
const integrationId = '1837789'
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient()

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


let completeOP =  async (paymentInfo) => {
    let checkUser = await db.users.findFirst({
        where: {
            id: parseInt(paymentInfo.state)
        }
    })

    if (!checkUser) {
        return false
    }

    await db.subscriptions.create({
        data: {
            user_id: checkUser.id,
            period: 1,
            isPermium: 1,
        }
    });

    let methods = await db.paymentMethods.findMany({});
    let tax = await db.govFees.findFirst({});
    let cashBackRules = await db.cashBackRules.findFirst({})

    let newAmount = parseInt(paymentInfo.amount) - (parseInt(paymentInfo.amount) * (methods[0].gatewayPercentage / 100)) - methods[0].gatewayConstant
    let TaxAndVat = parseInt(newAmount) - (parseInt(paymentInfo.amount) * (tax.VAT / 100)) - (parseInt(amount) * (tax.Tax / 100))
    let totalGovCuts = parseInt(newAmount) - parseInt(TaxAndVat)
    let newtotalGovCuts = parseInt(cashBackRules.totalGovCut) + parseInt(totalGovCuts)
    await db.cashBackRules.update({
        where: {
            id: 1
        },
        data: {
            totalGovCut: '' + newtotalGovCuts + ''
        }
    })
    // total fees for paymob
    let fees = (parseInt(paymentInfo.amount) * (methods[0].gatewayPercentage / 100)) + parseInt(methods[0].gatewayConstant)

    let perviousFees = await db.paymentGateWayFees.findFirst({
        where: {
            id: 2
        }
    })

    await db.paymentGateWayFees.update({
        where: {
            id: 2,
        },
        data: {
            totalFees: parseInt(perviousFees.totalFees) + fees
        }
    })

    // gross Money
    let getSubCatGross = await db.subCategories.findFirst({
        where: {
            id: parseInt(paymentInfo.subcategory_id)
        }
    })

    let gross = parseInt(getSubCatGross.grossMoney) + parseInt(newAmount)

    await db.subCategories.update({
        where: {
            id: parseInt(paymentInfo.subcategory_id)
        },
        data: {
            grossMoney: "" + gross + ""
        }
    })

    // Number of transaction

    let NumOfTransaction = parseInt(cashBackRules.transNum) + 1

    await db.cashBackRules.update({
        where: {
            id: 1
        },
        data: {
            transNum: "" + NumOfTransaction + ""
        }
    })

    let grossMoney = 0;
    let cost = 0;

    let fetchCashBackRules = await db.cashBackRules.findFirst({})
    let fetchCashBackStorage = await db.cashBackStorage.findFirst({})
    let subCategory = await db.subCategories.findMany({});

    for (item of subCategory) {
        let newGross = parseInt(item.grossMoney) / parseInt(item.paymentFactor)
        grossMoney += parseInt(newGross)
    }

    let overHeadFactor = parseInt(grossMoney)

    let runningCost = await db.runningCost.findMany({})
    for (item of runningCost) {
        cost += parseInt(item.amount)
    }

    let overHeadConstant = (cost / overHeadFactor)

    // update gross money for this category
    let subCategories = await db.subCategories.findFirst({
        where: {
            id: parseInt(paymentInfo.subcategory_id)
        }
    })

    let NetAfterOverHead = parseInt(paymentInfo.amount) - parseInt(overHeadConstant)
    let xFactor = parseInt(NetAfterOverHead) / parseInt(paymentFactor)
    let fourtyNineGain = parseInt(xFactor) * parseInt(portion)
    let ProviderCashBack = parseInt(xFactor) * parseInt(providerPortion)
    let NetAfterAllPortion = NetAfterOverHead - fourtyNineGain - `ProviderCashBack`
    let requestPortion = NetAfterAllPortion * (fetchCashBackRules.requestPortion / 100)
    let requestCall = NetAfterAllPortion * (fetchCashBackRules.callPortion / 100)
    let requestLike = NetAfterAllPortion * (fetchCashBackRules.likePortion / 100)
    let requestShare = NetAfterAllPortion * (fetchCashBackRules.sharePortion / 100)
    let requestView = NetAfterAllPortion * (fetchCashBackRules.viewPortion / 100)
    let requestAny = NetAfterAllPortion * (fetchCashBackRules.anyPortion / 100)
    let newFourtyNineGain = parseInt(fetchCashBackStorage.fourtyNineGain) + parseInt(fourtyNineGain)
    let newProviderCashBack = parseInt(ProviderCashBack) + parseInt(fetchCashBackStorage.providerCashBack)
    let newRequestCash = parseInt(requestPortion) + parseInt(fetchCashBackStorage.requestCashBack)
    let newCallCash = parseInt(requestCall) + parseInt(fetchCashBackStorage.callCashBack)
    let newLikeCash = parseInt(requestLike) + parseInt(fetchCashBackStorage.likeCashBack)
    let newShareCash = parseInt(requestShare) + parseInt(fetchCashBackStorage.shareCashBack)
    let newViewCash = parseInt(requestView) + parseInt(fetchCashBackStorage.viewCashBack)
    let newAnyCash = parseInt(requestAny) + parseInt(fetchCashBackStorage.anyCashBack)

    await db.cashBackStorage.update({
        where: {
            id: 1
        },
        data: {
            fourtyNineGain: "" + newFourtyNineGain + "",
            providerCashBack: "" + newProviderCashBack + "",
            requestCashBack: "" + newRequestCash + "",
            callCashBack: "" + newCallCash + "",
            likeCashBack: "" + newLikeCash + "",
            shareCashBack: "" + newShareCash + "",
            viewCashBack: "" + newViewCash + "",
            anyCashBack: "" + newAnyCash + "",
        }
    })

    return true;
}

module.exports = {
    getPaymobToken,
    makeOrder,
    paymentKeys,
    getHMACByOrderId,
    completeOP
}