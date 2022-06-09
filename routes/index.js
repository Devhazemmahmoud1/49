var express = require('express');
var router = express.Router();
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient();

/* GET home page. */
router.get('/paymentstatus', function(req, res) {
  //res.render('index', { title: 'Express' });
  console.log(req.io)
  return res.send('Everything is working good thanks kofta')
});

router.get('/socket', function (req, res) {
  return res.send('hello socket')
})


router.post('/finishing/op', async (req, res) => {

  var paymentInfo = {
    billing_data: {
      state: "1",
      floor: "3"
    },
    amount_cents: "2000"
  }
  
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
          period: "1",
          isPermium: 1,
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
})

router.get('/action/after/migrate', async function (req, res)  {

    // await db.appInfo.create({
    //     data: {
    //         intrest: 6,
    //     }
    // })

    // await db.admins.create({
    //     data: {
    //         'name': 'Hazem mahmoud hassan',
    //         'email': 'admin@admin.com',
    //         'password': '12345',
    //         'role': 1
    //     }
    // })

    // await db.cashBackRules.create({
    //     data: {
    //         step: 2,
    //         requestPortion: "50",
    //         callPortion: "10",
    //         likePortion: "10",
    //         viewPortion: "10",
    //         sharePortion: "10",
    //         anyPortion: "10",
    //         xFactor: "0",
    //         overHeadConstant: "0",
    //         overHeadFactor: "0",
    //         totalGovCut: "0",
    //         virtualMoney: "0",
    //         transNum: "0",
    //         overHeadPortion: "0"
    //     }
    // })

    // await db.cashBackStorage.create({
    //     data: {
    //         fees: 0,
    //         fourtyNineGain: "0",
    //         providerCashBack:"0",
    //         requestCashBack: "0",
    //         callCashBack: "0",
    //         likeCashBack: "0",
    //         viewCashBack:"0",
    //         shareCashBack: "0",
    //         anyCashBack: "0",
            
    //     }
    // })

    // await db.cashBackStep.create({
    //     data: {
    //         "step": 2.00,
    //     }
    // })

    // await db.govFees.create({
    //     data: {
    //         VAT: "14",
    //         Tax: "1.88"
    //     }
    // })

    await db.paymentMethods.create({
        data: {
            name: "PayMob",
            gatewayConstant: "1.5",
            gatewayPercentage: "2.25"
        }
    })

    await db.paymentGateWayFees.create({
        data: {
            paymentMethod: "PayMob",
            totalFees: 0
        }
    })

    return res.send('ok')
})

module.exports = router;
