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

async function paymentKeys(token, orderId, amount, period, userId, catId, isPermium) {

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
              "street": isPermium.toString(), 
              "building": period.toString(), 
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

    // //console.log(paymentInfo)
    // let checkUser = await db.users.findFirst({
    //     where: {
    //         id: parseInt(paymentInfo.billing_data.state)
    //     }
    // })
  
    // if (!checkUser) {
    //   console.log('here')
    //     return false
    // }
  
    // await db.subscriptions.create({
    //     data: {
    //         user_id: checkUser.id,
    //         period: "1",
    //         isPermium: parseInt(paymentInfo.billing_data.street),
    //     }
    // });
  
    // let amount = parseInt(paymentInfo.amount_cents / 100)
  
    // let methods = await db.paymentMethods.findMany({});
    // let tax = await db.govFees.findFirst({});
    // let cashBackRules = await db.cashBackRules.findFirst({})
    // let newAmount = parseInt(amount) - (parseInt(amount) * (methods[0].gatewayPercentage / 100)) - methods[0].gatewayConstant
    // let TaxAndVat = parseFloat(newAmount) - (parseFloat(amount) * (parseFloat(tax.VAT) / 100)) - (parseInt(amount) * (parseFloat(tax.Tax) / 100))
    // let totalGovCuts = parseFloat(newAmount) - parseFloat(TaxAndVat)
    // let newtotalGovCuts = parseFloat(cashBackRules.totalGovCut) + parseFloat(totalGovCuts)
    // await db.cashBackRules.update({
    //     where: {
    //         id: 1
    //     },
    //     data: {
    //         totalGovCut: '' + newtotalGovCuts + ''
    //     }
    // })
  
    // // total fees for paymob
    // let fees = (parseInt(amount) * (methods[0].gatewayPercentage / 100)) + parseFloat(methods[0].gatewayConstant)
    // console.log(fees, amount)
    // console.log((methods[0].gatewayPercentage / 100), parseFloat(methods[0].gatewayConstant))
    // let perviousFees = await db.paymentGateWayFees.findFirst({
    //     where: {
    //         id: 1
    //     }
    // })
  
    // await db.paymentGateWayFees.update({
    //     where: {
    //         id: 1,
    //     },
    //     data: {
    //         totalFees: parseFloat(perviousFees.totalFees) + fees
    //     }
    // })
  
    // // gross Money
    // let getSubCatGross = await db.subCategories.findFirst({
    //     where: {
    //         id: parseInt(paymentInfo.billing_data.floor)
    //     }
    // })
  
    // let gross = parseFloat(getSubCatGross.grossMoney) + parseFloat(newAmount)
  
    // await db.subCategories.update({
    //     where: {
    //         id: parseInt(paymentInfo.billing_data.floor)
    //     },
    //     data: {
    //         grossMoney: "" + gross + ""
    //     }
    // })
  
    // // Number of transaction
  
    // let NumOfTransaction = parseInt(cashBackRules.transNum) + 1
  
    // await db.cashBackRules.update({
    //     where: {
    //         id: 1
    //     },
    //     data: {
    //         transNum: "" + NumOfTransaction + ""
    //     }
    // })
  
    // let grossMoney = 0;
    // let cost = 0;
  
    // let fetchCashBackRules = await db.cashBackRules.findFirst({})
    // let fetchCashBackStorage = await db.cashBackStorage.findFirst({})
    // let subCategory = await db.subCategories.findMany({});
  
    // for (item of subCategory) {
    //   console.log(item.grossMoney, item.paymentFactor)
    //     let newGross = parseFloat(item.grossMoney) / parseFloat(item.paymentFactor)
    //     grossMoney += parseFloat(newGross)
    // }
  
    // console.log(grossMoney)
  
    // let overHeadFactor = parseFloat(grossMoney)
    // let runningCost = await db.runningCost.findMany({})
    
    // for (item of runningCost) {
    //     cost += parseInt(item.amount)
    // }
  
    // let overHeadConstant = (cost / overHeadFactor)
  
    // // update gross money for this category
    // let subCategories = await db.subCategories.findFirst({
    //     where: {
    //         id: parseInt(paymentInfo.billing_data.floor)
    //     }
    // })
  
    // let NetAfterOverHead = parseFloat(newAmount) - parseFloat(overHeadConstant)
    // console.log(NetAfterOverHead, overHeadConstant)
    // let xFactor = parseInt(NetAfterOverHead) / parseFloat(subCategories.paymentFactor)
    // let fourtyNineGain = parseFloat(xFactor) * parseFloat(subCategories.portion)
    // let ProviderCashBack = parseFloat(xFactor) * parseFloat(subCategories.providerPortion)
    // console.log(ProviderCashBack, fourtyNineGain)
    // let NetAfterAllPortion = NetAfterOverHead - fourtyNineGain - ProviderCashBack
    // let requestPortion = NetAfterAllPortion * parseFloat(fetchCashBackRules.requestPortion / 100)
    // let requestCall = NetAfterAllPortion * parseFloat(fetchCashBackRules.callPortion / 100)
    // let requestLike = NetAfterAllPortion * parseFloat(fetchCashBackRules.likePortion / 100)
    // let requestShare = NetAfterAllPortion * parseFloat(fetchCashBackRules.sharePortion / 100)
    // let requestView = NetAfterAllPortion * parseFloat(fetchCashBackRules.viewPortion / 100)
    // let requestAny = NetAfterAllPortion * parseFloat(fetchCashBackRules.anyPortion / 100)
    // let newFourtyNineGain = parseFloat(fetchCashBackStorage.fourtyNineGain) + parseFloat(fourtyNineGain)
    // let newProviderCashBack = parseFloat(ProviderCashBack) + parseFloat(fetchCashBackStorage.providerCashBack)
    // let newRequestCash = parseFloat(requestPortion) + parseFloat(fetchCashBackStorage.requestCashBack)
    // let newCallCash = parseFloat(requestCall) + parseFloat(fetchCashBackStorage.callCashBack)
    // let newLikeCash = parseFloat(requestLike) + parseFloat(fetchCashBackStorage.likeCashBack)
    // let newShareCash = parseFloat(requestShare) + parseFloat(fetchCashBackStorage.shareCashBack)
    // let newViewCash = parseFloat(requestView) + parseFloat(fetchCashBackStorage.viewCashBack)
    // let newAnyCash = parseFloat(requestAny) + parseFloat(fetchCashBackStorage.anyCashBack)
  
    // await db.cashBackStorage.update({
    //     where: {
    //         id: 1
    //     },
    //     data: {
    //         fourtyNineGain: "" + newFourtyNineGain + "",
    //         providerCashBack: "" + newProviderCashBack + "",
    //         requestCashBack: "" + newRequestCash + "",
    //         callCashBack: "" + newCallCash + "",
    //         likeCashBack: "" + newLikeCash + "",
    //         shareCashBack: "" + newShareCash + "",
    //         viewCashBack: "" + newViewCash + "",
    //         anyCashBack: "" + newAnyCash + "",
    //     }
    // })
  
    // return true;

    let checkUser = await db.users.findFirst({
        where: {
            id: parseInt(paymentInfo.billing_data.state)
        }
    })
  
    if (!checkUser) {
      console.log('here')
        return false
    }
  
    await db.subscriptions.create({
        data: {
            user_id: checkUser.id,
            period: paymentInfo.billing_data.building.toString(),
            isPermium: parseInt(paymentInfo.billing_data.street),
            subCat_id: parseInt(paymentInfo.billing_data.floor)
        }
    });
  
    let amount = parseInt(paymentInfo.amount_cents / 100)
  
    let methods = await db.paymentMethods.findMany({});
    let tax = await db.govFees.findFirst({});
    let cashBackRules = await db.cashBackRules.findFirst({})
    let newAmount = parseInt(amount) - (parseInt(amount) * (methods[0].gatewayPercentage / 100)) - methods[0].gatewayConstant
    let TaxAndVat = parseFloat(newAmount) - (parseFloat(amount) * (parseFloat(tax.VAT) / 100)) - (parseInt(amount) * (parseFloat(tax.Tax) / 100))
    let totalGovCuts = parseFloat(newAmount) - parseFloat(TaxAndVat)
    let newtotalGovCuts = parseFloat(cashBackRules.totalGovCut) + parseFloat(totalGovCuts)
    await db.cashBackRules.update({
        where: {
            id: 1
        },
        data: {
            totalGovCut: '' + newtotalGovCuts + ''
        }
    })
  
    // total fees for paymob
    let fees = (parseInt(amount) * (methods[0].gatewayPercentage / 100)) + parseFloat(methods[0].gatewayConstant)
    console.log(fees, amount)
    console.log((methods[0].gatewayPercentage / 100), parseFloat(methods[0].gatewayConstant))
    let perviousFees = await db.paymentGateWayFees.findFirst({
        where: {
            id: 1
        }
    })
  
    await db.paymentGateWayFees.update({
        where: {
            id: 1,
        },
        data: {
            totalFees: parseFloat(perviousFees.totalFees) + fees
        }
    })
  
    // gross Money
    let getSubCatGross = await db.subCategories.findFirst({
        where: {
            id: parseInt(paymentInfo.billing_data.floor)
        }
    })
  
    let gross = parseFloat(getSubCatGross.grossMoney) + parseFloat(newAmount)
  
    await db.subCategories.update({
        where: {
            id: parseInt(paymentInfo.billing_data.floor)
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
      console.log(item.grossMoney, item.paymentFactor)
        let newGross = parseFloat(item.grossMoney) / parseFloat(item.paymentFactor)
        grossMoney += parseFloat(newGross)
    }
  
    console.log(grossMoney)
  
    let overHeadFactor = parseFloat(grossMoney)
    let runningCost = await db.runningCost.findMany({})
    
    for (item of runningCost) {
        cost += parseInt(item.amount)
    }
  
    let overHeadConstant = (cost / overHeadFactor)
  
    // update gross money for this category
    let subCategories = await db.subCategories.findFirst({
        where: {
            id: parseInt(paymentInfo.billing_data.floor)
        }
    })
  
    let NetAfterOverHead = parseFloat(newAmount) - parseFloat(overHeadConstant)
    console.log(NetAfterOverHead, overHeadConstant)
    let xFactor = parseInt(NetAfterOverHead) / parseFloat(subCategories.paymentFactor)
    let fourtyNineGain = parseFloat(xFactor) * parseFloat(subCategories.portion)
    let ProviderCashBack = parseFloat(xFactor) * parseFloat(subCategories.providerPortion)
    console.log(ProviderCashBack, fourtyNineGain)
    let NetAfterAllPortion = NetAfterOverHead - fourtyNineGain - ProviderCashBack
    let requestPortion = NetAfterAllPortion * parseFloat(fetchCashBackRules.requestPortion / 100)
    let requestCall = NetAfterAllPortion * parseFloat(fetchCashBackRules.callPortion / 100)
    let requestLike = NetAfterAllPortion * parseFloat(fetchCashBackRules.likePortion / 100)
    let requestShare = NetAfterAllPortion * parseFloat(fetchCashBackRules.sharePortion / 100)
    let requestView = NetAfterAllPortion * parseFloat(fetchCashBackRules.viewPortion / 100)
    let requestAny = NetAfterAllPortion * parseFloat(fetchCashBackRules.anyPortion / 100)
    let newFourtyNineGain = parseFloat(fetchCashBackStorage.fourtyNineGain) + parseFloat(fourtyNineGain)
    let newProviderCashBack = parseFloat(ProviderCashBack) + parseFloat(fetchCashBackStorage.providerCashBack)
    let newRequestCash = parseFloat(requestPortion) + parseFloat(fetchCashBackStorage.requestCashBack)
    let newCallCash = parseFloat(requestCall) + parseFloat(fetchCashBackStorage.callCashBack)
    let newLikeCash = parseFloat(requestLike) + parseFloat(fetchCashBackStorage.likeCashBack)
    let newShareCash = parseFloat(requestShare) + parseFloat(fetchCashBackStorage.shareCashBack)
    let newViewCash = parseFloat(requestView) + parseFloat(fetchCashBackStorage.viewCashBack)
    let newAnyCash = parseFloat(requestAny) + parseFloat(fetchCashBackStorage.anyCashBack)
  
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