const express = require('express')
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient();
const moment = require('moment');
const dayjs = require('dayjs')
const { cashBackNotification } = require('../controllers/notificationsController/notifications')
const { sendNotification } = require('../controllers/notificationsController/SocialNotification')

/*  Get Daily/Monthly/Weekly prices according to the giving information  */
let getSubCategoryPrices = async (req, res, next) => {
    const { id } = req.params

    if (!id) {
        return res.status(403).json({
            error: {
                error_en: 'ID is not found',
                error_ar: 'الرقم غير صحيح'
            }
        })
    }

    let getPrice = await db.subCategories.findFirst({
        where: {
            id: parseInt(id)
        },
        select: {
            dailyPrice: true,
        }
    })

    let prices = {
        regular: {
            daily: getPrice.dailyPrice,
            weekly: (getPrice.dailyPrice * 7) - getPrice.dailyPrice,
            monthly: (getPrice.dailyPrice * 22),
            yearly: ((getPrice.dailyPrice) * 22) * 11
        },
        premium: {
            daily: getPrice.dailyPrice * 1.25,
            weekly: ((getPrice.dailyPrice * 1.25) * 7) - (getPrice.dailyPrice * 1.25),
            monthly: (getPrice.dailyPrice * 1.25) * 22,
            yearly: (((getPrice.dailyPrice * 1.25)) * 22) * 11
        }
    }

    return res.status(200).json(prices)
}

/*  Make a subscription for a specific user according to the givin information  */
let makeSubscriptionPayments = async (req, res) => {
    const { amount, isPermium, subcategory_id, isPersonal, period } = req.body
    if (!amount || !isPermium || !period || !subcategory_id) {
        return res.status(403).json({
            error: {
                error_en: 'Amount , type and payment method are required',
                error_ar: 'السعر و نوع الباقه و طريقه الدفع مطلوبه'
            }
        })
    }

    // var methods = await db.paymentMethods.findMany({});
    // var tax = await db.govFees.findFirst({});
    // var cashBackRules = await db.cashBackRules.findFirst({})

    // if (paymentMethod == 2) {
    // Wallet
    if (parseInt(req.user.Wallet.balance) >= parseInt(amount)) {

        let createSubscription = await db.subscriptions.create({
            data: {
                user_id: req.user.id,
                subCat_id: parseInt(subcategory_id),
                period: period.toString() ?? 1,
                isPermium: parseInt(isPermium) ?? 0,
                isPersonalAccount: parseInt(isPersonal) ?? 0,
                packageCounter: 0,
            }
        });


        for (socket in sockets) {
            if (sockets[socket].user_id == req.user.id) {
                sockets[socket].subscription = {
                    categoryId: createSubscription.subCat_id,
                    permium: createSubscription.isPermium,
                    stauts: 1,
                    startDate: createSubscription.updated_at,
                    isPersonalAccount: parseInt(isPersonal) ?? 0
                }
    
                sockets[socket].isPersonalAccount = parseInt(isPersonal) ?? 0;
    
                break;
            }
        }
    
        let updateUser = await db.users.update({
            where: {
                id: req.user.id
            },
            data: {
                accountType: parseInt(subcategory_id)
            }
        })

        let newBalance = parseInt(req.user.Wallet.balance) - parseInt(amount)
        let total = parseInt(req.user.Wallet.total) - parseInt(amount)

        if (req.user.Wallet.refundStorage > 0) {
            await db.wallet.update({
                where: {
                    user_id: req.user.id
                },
                data: {
                    balance: "" + newBalance + "",
                    //total: "" + total + "",
                    //startBalance: "" + parseInt(req.user.Wallet.startBalance) - parseInt(amount) + ""
                    //generatedBal: "" + total + "",
                }
            })

            return res.send('ok')
        } else {
            await db.wallet.update({
                where: {
                    user_id: req.user.id
                },
                data: {
                    balance: "" + newBalance + "",
                    total: "" + total + "",
                    startBalance: "" + parseInt(req.user.Wallet.startBalance) - parseInt(amount) + ""
                }
            })
        }

        let grossMoney = 0;
        let cost = 0;

        let fetchCashBackRules = await db.cashBackRules.findFirst({})
        let fetchCashBackStorage = await db.cashBackStorage.findFirst({})
        let subCategory = await db.subCategories.findMany({});
        // update gross money for this category
        let subCat = await db.subCategories.findFirst({
            where: {
                id: parseInt(subcategory_id)
            }
        })

        for (item of subCategory) {
            let newGross = parseFloat(item.grossMoney) / parseFloat(item.paymentFactor)
            grossMoney += parseFloat(newGross)
        }

        let overHeadFactor = parseInt(grossMoney)

        let runningCost = await db.runningCost.findMany({})
        for (item of runningCost) {
            cost += parseFloat(item.amount)
        }

        let overHeadConstant = (cost / overHeadFactor)
        let NetAfterOverHead = parseFloat(amount) - parseFloat(overHeadConstant)
        let xFactor = parseFloat(NetAfterOverHead) / parseFloat(parseFloat(subCat.paymentFactor))
        let fourtyNineGain = parseFloat(xFactor) * parseFloat(subCat.portion)
        let ProviderCashBack = parseFloat(xFactor) * parseFloat(subCat.providerPortion)
        let NetAfterAllPortion = NetAfterOverHead - fourtyNineGain - ProviderCashBack
        let requestPortion = NetAfterAllPortion * (fetchCashBackRules.requestPortion / 100)
        let requestCall = NetAfterAllPortion * (fetchCashBackRules.callPortion / 100)
        let requestLike = NetAfterAllPortion * (fetchCashBackRules.likePortion / 100)
        let requestShare = NetAfterAllPortion * (fetchCashBackRules.sharePortion / 100)
        let requestView = NetAfterAllPortion * (fetchCashBackRules.viewPortion / 100)
        let requestAny = NetAfterAllPortion * (fetchCashBackRules.anyPortion / 100)
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
                //providerCashBack: "" + newProviderCashBack + "",
                requestCashBack: "" + newRequestCash + "",
                callCashBack: "" + newCallCash + "",
                likeCashBack: "" + newLikeCash + "",
                shareCashBack: "" + newShareCash + "",
                viewCashBack: "" + newViewCash + "",
                anyCashBack: "" + newAnyCash + "",
            }
        })

        await db.users.update({
            where: {
                id: req.user.id
            },
            data: {
                providerCashBack: newProviderCashBack
            }
        })

        // update my profit every 30 days
        /* let intrest = 6;
         let profit = total * (intrest / 100) / 12
 
         // update total = oldtotal + profit
        */
    } else {
        return res.status(403).json({
            error: {
                error_en: 'There is no enough balance in your wallet.',
                error_ar: 'لا يوجد رصيد كافي في المحفظه.'
            }
        })
    }
    //} 
    //else if (paymentMethod == 1) {
    //     // PayMob   
    //     let newAmount = parseInt(amount) - (parseInt(amount) * (methods[0].gatewayPercentage / 100)) - methods[0].gatewayConstant
    //     let TaxAndVat = parseInt(newAmount) - (parseInt(amount) * (tax.VAT / 100)) - (parseInt(amount) * (tax.Tax / 100))
    //     let totalGovCuts = parseInt(newAmount) - parseInt(TaxAndVat)
    //     let newtotalGovCuts = parseInt(cashBackRules.totalGovCut) + parseInt(totalGovCuts)
    //     await db.cashBackRules.update({
    //         where: {
    //             id: 1
    //         },
    //         data: {
    //             totalGovCut: '' + newtotalGovCuts + ''
    //         }
    //     })
    //     // total fees for paymob
    //     let fees = (parseInt(amount) * (methods[0].gatewayPercentage / 100)) + parseInt(methods[0].gatewayConstant)

    //     let perviousFees = await db.paymentGateWayFees.findFirst({
    //         where: {
    //             id: 2
    //         }
    //     })

    //     await db.paymentGateWayFees.update({
    //         where: {
    //             id: 2,
    //         },
    //         data: {
    //             totalFees: parseInt(perviousFees.totalFees) + fees
    //         }
    //     })

    //     // gross Money
    //     let getSubCatGross = await db.subCategories.findFirst({
    //         where: {
    //             id: parseInt(subcategory_id)
    //         }
    //     })

    //     let gross = parseInt(getSubCatGross.grossMoney) + parseInt(newAmount)

    //     await db.subCategories.update({
    //         where: {
    //             id: parseInt(subcategory_id)
    //         },
    //         data: {
    //             grossMoney: "" + gross + ""
    //         }
    //     })

    //     // Number of transaction

    //     let NumOfTransaction = parseInt(cashBackRules.transNum) + 1

    //     await db.cashBackRules.update({
    //         where: {
    //             id: 1
    //         },
    //         data: {
    //             transNum: "" + NumOfTransaction + ""
    //         }
    //     })

    //     // Start Balance , Total

    //     /*let newBalance = parseInt(req.user.Wallet.balance) - parseInt(amount)
    //     let total = parseInt(req.user.Wallet.total) - parseInt(amount)

    //     await db.wallet.update({
    //         where: {
    //             user_id: req.user.id
    //         },
    //         data: {
    //             balance: "" + newBalance + "",
    //             total: "" + total + "",
    //             startBalance: "" + parseInt(req.user.Wallet.startBalance) - parseInt(amount) + ""
    //             //generatedBal: "" + total + "",
    //         }
    //     })*/

    //     // Profit

    //     let grossMoney = 0;
    //     let cost = 0;

    //     let fetchCashBackRules = await db.cashBackRules.findFirst({})
    //     let fetchCashBackStorage = await db.cashBackStorage.findFirst({})
    //     let subCategory = await db.subCategories.findMany({});

    //     for (item of subCategory) {
    //         let newGross = parseInt(item.grossMoney) / parseInt(item.paymentFactor)
    //         grossMoney += parseInt(newGross)
    //     }

    //     let overHeadFactor = parseInt(grossMoney)

    //     let runningCost = await db.runningCost.findMany({})
    //     for (item of runningCost) {
    //         cost += parseInt(item.amount)
    //     }

    //     let overHeadConstant = (cost / overHeadFactor)

    //     // update gross money for this category
    //     let subCategories = await db.subCategories.findFirst({
    //         where: {
    //             id: parseInt(subcategory_id)
    //         }
    //     })

    //     let NetAfterOverHead = parseInt(amount) - parseInt(overHeadConstant)
    //     let xFactor = parseInt(NetAfterOverHead) / parseInt(paymentFactor)
    //     let fourtyNineGain = parseInt(xFactor) * parseInt(portion)
    //     let ProviderCashBack = parseInt(xFactor) * parseInt(providerPortion)
    //     let NetAfterAllPortion = NetAfterOverHead - fourtyNineGain - `ProviderCashBack`
    //     let requestPortion = NetAfterAllPortion * (fetchCashBackRules.requestPortion / 100)
    //     let requestCall = NetAfterAllPortion * (fetchCashBackRules.callPortion / 100)
    //     let requestLike = NetAfterAllPortion * (fetchCashBackRules.likePortion / 100)
    //     let requestShare = NetAfterAllPortion * (fetchCashBackRules.sharePortion / 100)
    //     let requestView = NetAfterAllPortion * (fetchCashBackRules.viewPortion / 100)
    //     let requestAny = NetAfterAllPortion * (fetchCashBackRules.anyPortion / 100)
    //     let newFourtyNineGain = parseInt(fetchCashBackStorage.fourtyNineGain) + parseInt(fourtyNineGain)
    //     let newProviderCashBack = parseInt(ProviderCashBack) + parseInt(fetchCashBackStorage.providerCashBack)
    //     let newRequestCash = parseInt(requestPortion) + parseInt(fetchCashBackStorage.requestCashBack)
    //     let newCallCash = parseInt(requestCall) + parseInt(fetchCashBackStorage.callCashBack)
    //     let newLikeCash = parseInt(requestLike) + parseInt(fetchCashBackStorage.likeCashBack)
    //     let newShareCash = parseInt(requestShare) + parseInt(fetchCashBackStorage.shareCashBack)
    //     let newViewCash = parseInt(requestView) + parseInt(fetchCashBackStorage.viewCashBack)
    //     let newAnyCash = parseInt(requestAny) + parseInt(fetchCashBackStorage.anyCashBack)

    //     await db.cashBackStorage.update({
    //         where: {
    //             id: 1
    //         },
    //         data: {
    //             fourtyNineGain: "" + newFourtyNineGain + "",
    //             providerCashBack: "" + newProviderCashBack + "",
    //             requestCashBack: "" + newRequestCash + "",
    //             callCashBack: "" + newCallCash + "",
    //             likeCashBack: "" + newLikeCash + "",
    //             shareCashBack: "" + newShareCash + "",
    //             viewCashBack: "" + newViewCash + "",
    //             anyCashBack: "" + newAnyCash + "",
    //         }
    //     })

    // } 
    // else if (paymentMethod == 3) {
    //     // Paypal
    //     let newAmount = parseInt(amount) - (parseInt(amount) * (methods[2].gatewayPercentage / 100)) - methods[2].gatewayConstant
    //     let TaxAndVat = parseInt(newAmount) - (parseInt(amount) * (tax.VAT / 100)) - (parseInt(amount) * (tax.Tax / 100))
    //     let totalGovCuts = parseInt(newAmount) - parseInt(TaxAndVat)
    //     let newtotalGovCuts = parseInt(cashBackRules.totalGovCut) + parseInt(totalGovCuts)
    //     await db.cashBackRules.update({
    //         where: {
    //             id: 1
    //         },
    //         data: {
    //             totalGovCut: '' + newtotalGovCuts + ''
    //         }
    //     })

    //     // total fees for Paypal

    //     let fees = (parseInt(amount) * (methods[2].gatewayPercentage / 100)) + parseInt(methods[2].gatewayConstant)

    //     let perviousFees = await db.paymentGateWayFees.findFirst({
    //         where: {
    //             id: 3
    //         }
    //     })

    //     await db.paymentGateWayFees.update({
    //         where: {
    //             id: 3,
    //         },
    //         data: {
    //             totalFees: parseInt(perviousFees.totalFees) + fees
    //         }
    //     })

    //     // gross Money
    //     let getSubCatGross = await db.subCategories.findFirst({
    //         where: {
    //             id: parseInt(subcategory_id)
    //         }
    //     })

    //     let gross = parseInt(getSubCatGross.grossMoney) + parseInt(newAmount)

    //     await db.subCategories.update({
    //         where: {
    //             id: parseInt(subcategory_id)
    //         },
    //         data: {
    //             grossMoney: "" + gross + ""
    //         }
    //     })


    //     // Number of transaction

    //     let NumOfTransaction = parseInt(cashBackRules.transNum) + 1

    //     await db.cashBackRules.update({
    //         where: {
    //             id: 1
    //         },
    //         data: {
    //             transNum: "" + NumOfTransaction + ""
    //         }
    //     })

    //     // Start Balance , Total

    //     // Profit

    //     let grossMoney = 0;
    //     let cost = 0;

    //     let fetchCashBackRules = await db.cashBackRules.findFirst({})
    //     let fetchCashBackStorage = await db.cashBackStorage.findFirst({})
    //     let subCategory = await db.subCategories.findMany({});

    //     for (item of subCategory) {
    //         let newGross = parseInt(item.grossMoney) / parseInt(item.paymentFactor)
    //         grossMoney += parseInt(newGross)
    //     }

    //     let overHeadFactor = parseInt(grossMoney)

    //     let runningCost = await db.runningCost.findMany({})
    //     for (item of runningCost) {
    //         cost += parseInt(item.amount)
    //     }

    //     let overHeadConstant = (cost / overHeadFactor)

    //     // update gross money for this category
    //     let subCategories = await db.subCategories.findFirst({
    //         where: {
    //             id: parseInt(subcategry_id)
    //         }
    //     })

    //     let NetAfterOverHead = parseInt(amount) - parseInt(overHeadConstant)
    //     let xFactor = parseInt(NetAfterOverHead) / parseInt(paymentFactor)
    //     let fourtyNineGain = parseInt(xFactor) * parseInt(portion)
    //     let ProviderCashBack = parseInt(xFactor) * parseInt(providerPortion)
    //     let NetAfterAllPortion = NetAfterOverHead - fourtyNineGain - `ProviderCashBack`
    //     let requestPortion = NetAfterAllPortion * (fetchCashBackRules.requestPortion / 100)
    //     let requestCall = NetAfterAllPortion * (fetchCashBackRules.callPortion / 100)
    //     let requestLike = NetAfterAllPortion * (fetchCashBackRules.likePortion / 100)
    //     let requestShare = NetAfterAllPortion * (fetchCashBackRules.sharePortion / 100)
    //     let requestView = NetAfterAllPortion * (fetchCashBackRules.viewPortion / 100)
    //     let requestAny = NetAfterAllPortion * (fetchCashBackRules.anyPortion / 100)
    //     let newFourtyNineGain = parseInt(fetchCashBackStorage.fourtyNineGain) + parseInt(fourtyNineGain)
    //     let newProviderCashBack = parseInt(ProviderCashBack) + parseInt(fetchCashBackStorage.providerCashBack)
    //     let newRequestCash = parseInt(requestPortion) + parseInt(fetchCashBackStorage.requestCashBack)
    //     let newCallCash = parseInt(requestCall) + parseInt(fetchCashBackStorage.callCashBack)
    //     let newLikeCash = parseInt(requestLike) + parseInt(fetchCashBackStorage.likeCashBack)
    //     let newShareCash = parseInt(requestShare) + parseInt(fetchCashBackStorage.shareCashBack)
    //     let newViewCash = parseInt(requestView) + parseInt(fetchCashBackStorage.viewCashBack)
    //     let newAnyCash = parseInt(requestAny) + parseInt(fetchCashBackStorage.anyCashBack)

    //     await db.cashBackStorage.update({
    //         where: {
    //             id: 1
    //         },
    //         data: {
    //             fourtyNineGain: "" + newFourtyNineGain + "",
    //             providerCashBack: "" + newProviderCashBack + "",
    //             requestCashBack: "" + newRequestCash + "",
    //             callCashBack: "" + newCallCash + "",
    //             likeCashBack: "" + newLikeCash + "",
    //             shareCashBack: "" + newShareCash + "",
    //             viewCashBack: "" + newViewCash + "",
    //             anyCashBack: "" + newAnyCash + "",
    //         }
    //     })


    // } else if (paymentMethod == 4) {
    //     // Vodafone Cash
    //     let newAmount = parseInt(amount) - (parseInt(amount) * (methods[3].gatewayPercentage / 100))
    //     let TaxAndVat = parseInt(newAmount) - (parseInt(amount) * (tax.VAT / 100)) - (parseInt(amount) * (tax.Tax / 100))
    //     let totalGovCuts = parseInt(newAmount) - parseInt(TaxAndVat)
    //     let newtotalGovCuts = parseInt(cashBackRules.totalGovCut) + parseInt(totalGovCuts)
    //     await db.cashBackRules.update({
    //         where: {
    //             id: 1
    //         },
    //         data: {
    //             totalGovCut: '' + newtotalGovCuts + ''
    //         }
    //     })

    //     let fees = (parseInt(amount) * (methods[3].gatewayPercentage / 100))

    //     let perviousFees = await db.paymentGateWayFees.findFirst({
    //         where: {
    //             id: 4
    //         }
    //     })

    //     await db.paymentGateWayFees.update({
    //         where: {
    //             id: 4,
    //         },
    //         data: {
    //             totalFees: parseInt(perviousFees.totalFees) + fees
    //         }
    //     })

    //     // gross Money
    //     let getSubCatGross = await db.subCategories.findFirst({
    //         where: {
    //             id: parseInt(subcategory_id)
    //         }
    //     })

    //     let gross = parseInt(getSubCatGross.grossMoney) + parseInt(newAmount)

    //     await db.subCategories.update({
    //         where: {
    //             id: parseInt(subcategory_id)
    //         },
    //         data: {
    //             grossMoney: "" + gross + ""
    //         }
    //     })


    //     // Number of transaction

    //     let NumOfTransaction = parseInt(cashBackRules.transNum) + 1

    //     await db.cashBackRules.update({
    //         where: {
    //             id: 1
    //         },
    //         data: {
    //             transNum: "" + NumOfTransaction + ""
    //         }
    //     })

    //     // Start Balance , Total

    //     let grossMoney = 0;
    //     let cost = 0;

    //     let fetchCashBackRules = await db.cashBackRules.findFirst({})
    //     let fetchCashBackStorage = await db.cashBackStorage.findFirst({})
    //     let subCategory = await db.subCategories.findMany({});

    //     for (item of subCategory) {
    //         let newGross = parseInt(item.grossMoney) / parseInt(item.paymentFactor)
    //         grossMoney += parseInt(newGross)
    //     }

    //     let overHeadFactor = parseInt(grossMoney)

    //     let runningCost = await db.runningCost.findMany({})
    //     for (item of runningCost) {
    //         cost += parseInt(item.amount)
    //     }

    //     let overHeadConstant = (cost / overHeadFactor)

    //     // update gross money for this category
    //     let subCategories = await db.subCategories.findFirst({
    //         where: {
    //             id: parseInt(subcategry_id)
    //         }
    //     })

    //     let NetAfterOverHead = parseInt(amount) - parseInt(overHeadConstant)
    //     let xFactor = parseInt(NetAfterOverHead) / parseInt(paymentFactor)
    //     let fourtyNineGain = parseInt(xFactor) * parseInt(portion)
    //     let ProviderCashBack = parseInt(xFactor) * parseInt(providerPortion)
    //     let NetAfterAllPortion = NetAfterOverHead - fourtyNineGain - `ProviderCashBack`
    //     let requestPortion = NetAfterAllPortion * (fetchCashBackRules.requestPortion / 100)
    //     let requestCall = NetAfterAllPortion * (fetchCashBackRules.callPortion / 100)
    //     let requestLike = NetAfterAllPortion * (fetchCashBackRules.likePortion / 100)
    //     let requestShare = NetAfterAllPortion * (fetchCashBackRules.sharePortion / 100)
    //     let requestView = NetAfterAllPortion * (fetchCashBackRules.viewPortion / 100)
    //     let requestAny = NetAfterAllPortion * (fetchCashBackRules.anyPortion / 100)
    //     let newFourtyNineGain = parseInt(fetchCashBackStorage.fourtyNineGain) + parseInt(fourtyNineGain)
    //     let newProviderCashBack = parseInt(ProviderCashBack) + parseInt(fetchCashBackStorage.providerCashBack)
    //     let newRequestCash = parseInt(requestPortion) + parseInt(fetchCashBackStorage.requestCashBack)
    //     let newCallCash = parseInt(requestCall) + parseInt(fetchCashBackStorage.callCashBack)
    //     let newLikeCash = parseInt(requestLike) + parseInt(fetchCashBackStorage.likeCashBack)
    //     let newShareCash = parseInt(requestShare) + parseInt(fetchCashBackStorage.shareCashBack)
    //     let newViewCash = parseInt(requestView) + parseInt(fetchCashBackStorage.viewCashBack)
    //     let newAnyCash = parseInt(requestAny) + parseInt(fetchCashBackStorage.anyCashBack)

    //     await db.cashBackStorage.update({
    //         where: {
    //             id: 1
    //         },
    //         data: {
    //             fourtyNineGain: "" + newFourtyNineGain + "",
    //             providerCashBack: "" + newProviderCashBack + "",
    //             requestCashBack: "" + newRequestCash + "",
    //             callCashBack: "" + newCallCash + "",
    //             likeCashBack: "" + newLikeCash + "",
    //             shareCashBack: "" + newShareCash + "",
    //             viewCashBack: "" + newViewCash + "",
    //             anyCashBack: "" + newAnyCash + "",
    //         }
    //     })

    // }

    // if (createSubscription) {
    //     if (isWithdrawing == 0) {
    //         // create payment for this user
    //         let createPayment = await db.payment.create({
    //             data: {
    //                 paymentIn: amount,
    //                 paymentOut: "0",
    //                 transNum: "0",
    //                 paymentMethod: paymentMethod,
    //                 user_id: req.user.id
    //             }
    //         })

    //         if (createPayment) {
    //             await db.walletActivity.create({
    //                 data: {
    //                     wallet_id: req.user.Wallet.id,
    //                     activityType: 1,
    //                     activityText: ''
    //                 }
    //             })
    //         }
    //     }

        //return res.status(200).json('OK')
    // }
}

/* This method is for charging balance for a specific user */
let chargeBalance = async (req, res) => {
    const { amount, paymentMethod } = req.body

    if (!amount) {
        return res.status(403).json({
            error: {
                error_en: 'Amount is not defined',
                error_ar: 'السعر غير معروف'
            }
        });
    }

    // no cashback

    // total and balance , GovFees , PaymentGateWayFees

    let createPayment = await db.payment.create({
        data: {
            paymentIn: amount,
            paymentOut: "0",
            transNum: "0",
            paymentMethod: paymentMethod,
            user_id: req.user.id
        }
    })

    // update balance 

    let newWallerBalance = parseInt(req.user.Wallet.balance) + parseInt(amount)

    await db.wallet.update({
        where: {
            user_id: req.user.id
        },
        data: {
            balance: "" + newWallerBalance + "",
            //total:   parseInt(req.user.Wallet.balance) + parseInt(amount)
        }
    })

    let cashBackRules = await db.cashBackRules.findFirst({})
    let tax = await db.govFees.findFirst({})
    let methods = await db.paymentMethods.findMany({})

    if (createPayment) {
        if (paymentMethod == 1) {
            // PayMob   
            let newAmount = parseInt(amount) - (parseInt(amount) * (methods[0].gatewayPercentage / 100)) - methods[0].gatewayConstant
            let TaxAndVat = parseInt(newAmount) - (parseInt(amount) * (tax.VAT / 100)) - (parseInt(amount) * (tax.Tax / 100))
            let totalGovCuts = parseInt(newAmount) - parseInt(TaxAndVat)
            let newtotalGovCuts = parseInt(cashBackRules.totalGovCut) + parseInt(totalGovCuts)

            let fees = (parseInt(amount) * (methods[0].gatewayPercentage / 100)) + parseInt(methods[0].gatewayConstant)

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

            await db.cashBackRules.update({
                where: {
                    id: 1,
                },
                data: {
                    totalGovCut: "" + newtotalGovCuts + ""
                }
            })

            await db.wallet.update({
                where: {
                    user_id: req.user.id
                },
                data: {
                    startBalance: "" + newAmount + "",
                    //total:   parseInt(req.user.Wallet.balance) + parseInt(amount)
                }
            })

        } else if (paymentMethod == 3) {
            // Paypal 

            let newAmount = parseInt(amount) - (parseInt(amount) * (methods[2].gatewayPercentage / 100)) - methods[2].gatewayConstant
            let TaxAndVat = parseInt(newAmount) - (parseInt(amount) * (tax.VAT / 100)) - (parseInt(amount) * (tax.Tax / 100))
            let totalGovCuts = parseInt(newAmount) - parseInt(TaxAndVat)
            let newtotalGovCuts = parseInt(cashBackRules.totalGovCut) + parseInt(totalGovCuts)

            let fees = (parseInt(amount) * (methods[2].gatewayPercentage / 100)) + parseInt(methods[2].gatewayConstant)

            let perviousFees = await db.paymentGateWayFees.findFirst({
                where: {
                    id: 3
                }
            })

            await db.paymentGateWayFees.update({
                where: {
                    id: 3,
                },
                data: {
                    totalFees: parseInt(perviousFees.totalFees) + fees
                }
            })

            await db.cashBackRules.update({
                where: {
                    id: 1,
                },
                data: {
                    totalGovCut: "" + newtotalGovCuts + ""
                }
            })

            await db.wallet.update({
                where: {
                    user_id: req.user.id
                },
                data: {
                    startBalance: "" + newAmount + "",
                    //total:   parseInt(req.user.Wallet.balance) + parseInt(amount)
                }
            })
        } else if (paymentMethod == 4) {
            // VodaFone Cash
            let newAmount = parseInt(amount) - (parseInt(amount) * (methods[3].gatewayPercentage / 100))
            let TaxAndVat = parseInt(newAmount) - (parseInt(amount) * (tax.VAT / 100)) - (parseInt(amount) * (tax.Tax / 100))
            let totalGovCuts = parseInt(newAmount) - parseInt(TaxAndVat)
            let newtotalGovCuts = parseInt(cashBackRules.totalGovCut) + parseInt(totalGovCuts)

            let fees = (parseInt(amount) * (methods[3].gatewayPercentage / 100)) + parseInt(methods[3].gatewayConstant)

            let perviousFees = await db.paymentGateWayFees.findFirst({
                where: {
                    id: 4
                }
            })

            await db.paymentGateWayFees.update({
                where: {
                    id: 4,
                },
                data: {
                    totalFees: parseInt(perviousFees.totalFees) + fees
                }
            })

            await db.cashBackRules.update({
                where: {
                    id: 1,
                },
                data: {
                    totalGovCut: "" + newtotalGovCuts + ""
                }
            })

            await db.wallet.update({
                where: {
                    user_id: req.user.id
                },
                data: {
                    startBalance: "" + newAmount + "",
                    //total:   parseInt(req.user.Wallet.balance) + parseInt(amount)
                }
            })
        }

        await db.walletActivity.create({
            data: {
                wallet_id: req.user.Wallet.id,
                activityType: 2,
                activityText: ''
            }
        })
        return res.status(200).json("Ok")
    }

    // Profit required
}

/* This method is for transfering money to another user */
let transferTo = async (req, res) => {
    const { amount, transNum } = req.body

    const fees = 2;

    // check if the givin transfer number is correct

    let checkPhone = await db.users.findFirst({
        where: {
            phone: transNum
        },
        include: {
            Wallet: true
        }
    })

    if (!checkPhone) {
        return res.stats(403).json({
            error: {
                error_en: 'This phone number does not exist',
                error_ar: 'رقم الهاتف غير موجود'
            }
        })
    }

    // get TransNum wallet
    if (!amount) {
        return res.stats(403).json({
            error: {
                error_en: 'Amount is required',
                error_ar: 'القيمه غير متاحه'
            }
        })
    }

    // check if my user has the giving amount + 2 units
    let checkWallet = await db.wallet.findFirst({
        where: {
            user_id: req.user.id
        },
        select: {
            balance: true
        }
    })

    // validate some rules in order to proceed

    /*let getSubscriptions = await db.subscriptions.findMany({
        where: {
            user_id: req.user.id
        }
    })

    let getSubcriptionsForTheOtherUser = await db.subscriptions.findMany({
        where: {
            user_id: checkPhone.id
        }
    })

    var isUserSub = false;
    var isTheOtherUserSub = false;

    for (item of getSubscriptions) {
        if (moment(item.created_at).add(item.period, 'days').format('YYYY/MM/DD HH:mm:ss') > moment().format('YYYY/MM/DD HH:mm:ss')) {
            isUserSub = true;
        }
    }

    for (item of getSubcriptionsForTheOtherUser) {
        if (moment(item.created_at).add(item.period, 'days').format('YYYY/MM/DD HH:mm:ss') > moment().format('YYYY/MM/DD HH:mm:ss')) {
            isTheOtherUserSub = true;
        }        
    }

    if (isUserSub == false || isTheOtherUserSub == false) {
        return res.status(403).json({
            error: {
                error_en: 'This transaction can not be completed , Both numbers have to subscribe',
                error_ar: 'هذا التحويل مرفوض ، كلا الرقمين عليهم الاشتراك'
            }
        })
    } */

    // check for the last payment date


    //  # Rule Number 1

    let checkForPeriod = await db.walletActivity.findFirst({
        orderBy: { id: 'desc' },
        where: {
            wallet_id: req.user.Wallet.id,
            activityType: 3,
        }
    })

    /*if (moment(req.user.created_at).add(30, 'days').format('YYYY/MM/DD HH:mm:ss') > moment().format('YYYY/MM/DD HH:mm:ss')) {
        return res.status(403).json({
            error: {
                error_en: 'You can only use this feature once a month',
                error_ar: 'يمكنك استخدام هذه الخدمه مره كل شهر'
            }
        })
    }*/

    if ((parseInt(checkWallet.balance + fees)) < parseInt(amount)) {
        return res.status(403).json({
            error: {
                error_en: 'You do not have enough amount',
                error_ar: 'ليس لديك رصيد كافي'
            }
        })
    }

    // # Rule Number 2

    /*
    if (moment(checkPhone.created_at).add(30, 'days').format('YYYY/MM/DD HH:mm:ss') > moment().format('YYYY/MM/DD HH:mm:ss') || moment(req.user.created_at).add(30, 'days').format('YYYY/MM/DD HH:mm:ss') > moment().format('YYYY/MM/DD HH:mm:ss')) {
        return res.status(403).json({
            error: {
                error_en: 'You can not use this feature before one month of registeration',
                error_ar: 'لا يمكنك استخدام هذه الخدمه قبل شهر من التسجيل'
            }
        })
    }
    */


    // transfer process

    let newamount = (parseInt(amount) + fees)

    let newBalance = (parseInt(checkWallet.balance)) - parseInt(newamount)

    //let newStartBalance = parseInt(req.user.Wallet.startBalance) - 2

    await db.wallet.update({
        where: {
            user_id: req.user.id
        },
        data: {
            balance: "" + newBalance + "",
            //startBalance: "" + newStartBalance + ""
        }
    })

    let newAmount = parseInt(checkPhone.Wallet.balance) + parseInt(amount)

    //let newStartBalanceuser = parseInt(checkPhone.Wallet.startBalance) + parseInt(amount)

    await db.wallet.update({
        where: {
            user_id: checkPhone.id
        },
        data: {
            balance: "" + newAmount + "",
            //startBalance: "" + newStartBalanceuser + ""
        }
    })

    // create an activity for my end

    await db.walletActivity.create({
        data: {
            wallet_id: req.user.Wallet.id,
            activityType: 3,
            activityText: '',
        }
    })


    // create an activity for the transfered user

    await db.walletActivity.create({
        data: {
            wallet_id: checkPhone.Wallet.id,
            activityType: 7,
            activityText: ''
        }
    })

    let getGains = await db.cashBackStorage.findFirst({})

    let gains = parseInt(getGains.fourtyNineGain) + fees


    await db.cashBackStorage.update({
        where: {
            id: 1,
        },
        data: {
            fourtyNineGain: "" + gains + ""
        }
    })

    // create a payment for this user

    await db.payment.create({
        data: {
            paymentIn: amount,
            paymentOut: "0",
            transNum: transNum,
            paymentMethod: 2,
            user_id: req.user.id
        }

    })

    // create a payment for this user

    await db.payment.create({
        data: {
            paymentIn: amount,
            paymentOut: "0",
            transNum: req.user.phone,
            paymentMethod: 2,
            user_id: checkPhone.id
        }

    })

    return res.status(200).json({
        message: 'OK'
    })

}

/*  PaymentOut */
let withdrawMoney = async (req, res) => {

    // -1000 # Wallet must have the amount + 2 #paymentOut # Get Total PaymentOut - Total SubCatGrossMoney
    const { amount } = req.body

    if (!amount || parseInt(req.user.Wallet.balance) <= 1002) {
        return res.status(403).json({
            error: {
                error_en: 'Withdraw limit is 1002 unit',
                error_ar: 'حد السحب المسموح هو ١٠٠٢ وحده'
            }
        })
    }

    // reduce amount from wallet

    let newWalletBalance = parseInt(req.user.Wallet.balance) - (parseInt(amount) + 2)

    let newStartBalance = -(parseInt(amount) + 2)

    await db.wallet.update({
        where: {
            user_id: req.user.id
        },
        data: {
            balance: "" + newWalletBalance + "",
            startBalance: "" + newStartBalance + ""
        }
    })

    // create a payment

    await db.payment.create({
        data: {
            user_id: req.user.id,
            paymentIn: "0",
            paymentOut: "" + amount + "",
            transNum: "0",
            paymentMethod: 2,
        }
    })

    // create an activity

    await db.walletActivity.create({
        data: {
            wallet_id: req.user.Wallet.id,
            activityType: 4,
            activityText: ''
        }
    })

    // update FourtyNine Gains

    let gains = await db.cashBackStorage.findFirst({})

    let newGains = parseInt(gains.fourtyNineGain) + 2

    await db.cashBackStorage.update({
        where: {
            id: 1
        },
        data: {
            fourtyNineGain: "" + newGains + ""
        }
    })

    // Notify admins with new Payout requests
    await db.payoutRequests.create({
        data: {
            user_id: req.user.id,
            amount: "" + amount + "",
        }
    })

    return res.status(200).send("ok")

}

/* Get User information */
let userInfo = async (req, res) => {
    return res.json(req.user)
}

/* Request Call API [ CashBack ] */
let makeRequest = async (req, res) => {
    const { request } = req.body

    // [1 => request, 2 => call, 3 => anyRequest] 
    try {
        let checkIfAppOweMeMoney = await db.wallet.findFirst({
            where: {
                user_id: req.user.id
            }
        })

        let getStep = await db.cashBackStep.findFirst({})

        var totalStepsOfToday = await db.dailyCashBack.findMany({
            where: {
                user_id: req.user.id,
            },
        });

        var counter = 0;

        for (item of totalStepsOfToday) {
            console.log(dayjs(item.created_at, '"MM-DD-YYYY"').$d > dayjs().startOf('day').$d, dayjs().endOf('day').$d > dayjs(item.created_at, '"MM-DD-YYYY"').$d)
            if (dayjs().startOf('day').$d < dayjs(item.created_at, '"MM-DD-YYYY"').$d && dayjs().endOf('day').$d > dayjs(item.created_at, '"MM-DD-YYYY"').$d) {
                console.log('still going on steps')
                counter = parseInt(counter + parseInt(item.amount))
            }
        }

        let refundStorage = parseInt(req.user.Wallet.refundStorage)

        var newRefundSumBalance = refundStorage + parseInt(getStep.step)

        var newRefundDeBalance = refundStorage - parseInt(getStep.step)

        var newBalanceSum = parseInt(req.user.Wallet.balance) + parseInt(getStep.step)

        // we need to check for my own ref

        var getMyinvitor = await db.ref.findFirst({
            where: {
                invited: req.user.id ?? undefined
            }
        })

        if (getMyinvitor) {
            var getRefUser = await db.users.findFirst({
                where: {
                    id: getMyinvitor.inviter ?? undefined
                },
                include: {
                    Wallet: true,
                }
            })
        }


        if (counter >= 10) {
            return res.status(200).send('you maxed out 10L.E');
        }

        if (checkIfAppOweMeMoney.refundStorage > 0) {
            if (checkIfAppOweMeMoney.FreeClicksStorage >= 500) {
                if (parseInt(req.user.providerCashBack) > 0) {
                    if (parseInt(req.user.providerCashBack) - parseInt(getStep.step) >= 0) {
                        await db.users.update({
                            where: {
                                id: req.user.id
                            },
                            data: {
                                providerCashBack: parseInt(req.user.providerCashBack) - parseInt(getStep.step)
                            }
                        })

                        await db.wallet.update({
                            where: {
                                user_id: req.user.id,
                            },
                            data: {
                                refundStorage: newRefundDeBalance
                            }
                        })

                        await db.dailyCashBack.create({
                            data: {
                                user_id: req.user.id,
                                amount: getStep.step
                            }
                        })

                        let notify = {
                            userFirstName: req.user.firstName,
                            reciever: req.user.id,
                            sender: 0,
                            postId: 0,
                            user: req.user.id,
                            amount: getStep.step,
                            type: 1000,
                            taps: 1,
                            notification_en: `You have got ${getStep.step} as cashback from 49.`,
                            notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                        }

                        sendNotification(notify, req.user.id)

                        cashBackNotification(notify)

                        return res.status(200).send('OP DONE.');
                    } else {
                        let getStorage = await db.cashBackStorage.findFirst({});
                        if (parseInt(req.user.providerCashBack) <= 0) {
                            var getCurrentProviderCashBack = 0
                        } else {
                            var getCurrentProviderCashBack = req.user.providerCashBack
                        }

                        let totalCalcu = parseInt(getStep.step) - parseInt(getCurrentProviderCashBack)

                        await db.users.update({
                            where: {
                                id: req.user.id
                            },
                            data: {
                                providerCashBack: 0
                            }
                        })

                        if (request == 2) {
                            let call = getStorage.callCashBack
                            if (parseInt(call) <= 0) {
                                console.log(2000)
                                let newRefundDeBalanceWithoutCallStorage = parseInt(req.user.Wallet.refundStorage)
                                    - parseInt(totalCalcu)

                                await db.wallet.update({
                                    where: {
                                        user_id: req.user.id
                                    },
                                    data: {
                                        refundStorage: newRefundDeBalanceWithoutCallStorage
                                    }
                                })
                                await db.dailyCashBack.create({
                                    data: {
                                        user_id: req.user.id,
                                        amount: totalCalcu
                                    }
                                })

                                return res.status(200).send('NO CashBack found');
                            } else {
                                if (parseInt(call) - parseInt(totalCalcu) >= 0) {
                                    await db.cashBackStorage.update({
                                        where: {
                                            id: 1
                                        }, data: {
                                            callCashBack: "" + parseInt(getStorage.callCashBack) - parseInt(totalCalcu) + ""
                                        }
                                    })

                                    await db.wallet.update({
                                        where: {
                                            user_id: req.user.id
                                        },
                                        data: {
                                            refundStorage: newRefundDeBalance
                                        }
                                    })
                                    await db.dailyCashBack.create({
                                        data: {
                                            user_id: req.user.id,
                                            amount: getStep.step
                                        }
                                    })

                                    let notify = {
                                        userFirstName: req.user.firstName,
                                        reciever: req.user.id,
                                        sender: 0,
                                        postId: 0,
                                        user: req.user.id,
                                        amount: getStep.step,
                                        type: 1000,
                                        taps: 1,
                                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                    }

                                    sendNotification(notify, req.user.id)
                                    cashBackNotification(notify)

                                    return res.status(200).send('Cashback and provider effected')
                                } else {
                                    await db.cashBackStorage.update({
                                        where: {
                                            id: 1
                                        }, data: {
                                            callCashBack: 0
                                        }
                                    })

                                    await db.wallet.update({
                                        where: {
                                            user_id: req.user.id
                                        },
                                        data: {
                                            refundStorage: newRefundDeBalance
                                        }
                                    })
                                    await db.dailyCashBack.create({
                                        data: {
                                            user_id: req.user.id,
                                            amount: getStep.step
                                        }
                                    })

                                    let notify = {
                                        userFirstName: req.user.firstName,
                                        reciever: req.user.id,
                                        sender: 0,
                                        postId: 0,
                                        user: req.user.id,
                                        amount: getStep.step,
                                        type: 1000,
                                        taps: 1,
                                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                    }

                                    sendNotification(notify, req.user.id)

                                    return res.status(200).send('No CashBack found but provider effected')
                                }
                            }
                        } else if (request == 1) {
                            let requestcb = getStorage.requestCashBack
                            if (parseInt(call) <= 0) {
                                console.log(2000)
                                let newRefundDeBalanceWithoutCallStorage = parseInt(req.user.Wallet.refundStorage)
                                    - parseInt(totalCalcu)

                                await db.wallet.update({
                                    where: {
                                        user_id: req.user.id
                                    },
                                    data: {
                                        refundStorage: newRefundDeBalanceWithoutCallStorage
                                    }
                                })
                                await db.dailyCashBack.create({
                                    data: {
                                        user_id: req.user.id,
                                        amount: totalCalcu
                                    }
                                })

                                return res.status(200).send('NO CashBack found');
                            } else {
                                if (parseInt(requestcb) - parseInt(totalCalcu) >= 0) {
                                    await db.cashBackStorage.update({
                                        where: {
                                            id: 1
                                        }, data: {
                                            requestCashBack: "" + parseInt(getStorage.requestCashBack) - parseInt(totalCalcu) + ""
                                        }
                                    })

                                    await db.wallet.update({
                                        where: {
                                            user_id: req.user.id
                                        },
                                        data: {
                                            refundStorage: newRefundDeBalance
                                        }
                                    })
                                    await db.dailyCashBack.create({
                                        data: {
                                            user_id: req.user.id,
                                            amount: getStep.step
                                        }
                                    })

                                    let notify = {
                                        userFirstName: req.user.firstName,
                                        reciever: req.user.id,
                                        sender: 0,
                                        postId: 0,
                                        user: req.user.id,
                                        amount: getStep.step,
                                        type: 1000,
                                        taps: 1,
                                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                    }

                                    sendNotification(notify, req.user.id)

                                    cashBackNotification(notify)

                                    return res.status(200).send('Cashback and provider effected')
                                } else {
                                    await db.cashBackStorage.update({
                                        where: {
                                            id: 1
                                        }, data: {
                                            requestCashBack: 0
                                        }
                                    })

                                    await db.wallet.update({
                                        where: {
                                            user_id: req.user.id
                                        },
                                        data: {
                                            refundStorage: newRefundDeBalance
                                        }
                                    })
                                    await db.dailyCashBack.create({
                                        data: {
                                            user_id: req.user.id,
                                            amount: getStep.step
                                        }
                                    })

                                    let notify = {
                                        userFirstName: req.user.firstName,
                                        reciever: req.user.id,
                                        sender: 0,
                                        postId: 0,
                                        user: req.user.id,
                                        amount: getStep.step,
                                        type: 1000,
                                        taps: 1,
                                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                    }

                                    sendNotification(notify, req.user.id)

                                    cashBackNotification(notify)

                                    return res.status(200).send('No CashBack found but provider effected')
                                }
                            }
                        } else if (request == 3) {
                            let any = getStorage.anyCashBack
                            if (parseInt(any) <= 0) {
                                console.log(2000)
                                let newRefundDeBalanceWithoutCallStorage = parseInt(req.user.Wallet.refundStorage)
                                    - parseInt(totalCalcu)

                                await db.wallet.update({
                                    where: {
                                        user_id: req.user.id
                                    },
                                    data: {
                                        refundStorage: newRefundDeBalanceWithoutCallStorage
                                    }
                                })
                                await db.dailyCashBack.create({
                                    data: {
                                        user_id: req.user.id,
                                        amount: totalCalcu
                                    }
                                })

                                return res.status(200).send('NO CashBack found');
                            } else {
                                if (parseInt(requestcb) - parseInt(totalCalcu) >= 0) {
                                    await db.cashBackStorage.update({
                                        where: {
                                            id: 1
                                        }, data: {
                                            anyCashBack: "" + parseInt(getStorage.anyCashBack) - parseInt(totalCalcu) + ""
                                        }
                                    })

                                    await db.wallet.update({
                                        where: {
                                            user_id: req.user.id
                                        },
                                        data: {
                                            refundStorage: newRefundDeBalance
                                        }
                                    })
                                    await db.dailyCashBack.create({
                                        data: {
                                            user_id: req.user.id,
                                            amount: getStep.step
                                        }
                                    })

                                    let notify = {
                                        userFirstName: req.user.firstName,
                                        reciever: req.user.id,
                                        sender: 0,
                                        postId: 0,
                                        user: req.user.id,
                                        amount: getStep.step,
                                        type: 1000,
                                        taps: 1,
                                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                    }

                                    sendNotification(notify, req.user.id)

                                    cashBackNotification(notify)

                                    return res.status(200).send('Cashback and provider effected')
                                } else {
                                    await db.cashBackStorage.update({
                                        where: {
                                            id: 1
                                        }, data: {
                                            anyCashBack: "0"
                                        }
                                    })

                                    await db.wallet.update({
                                        where: {
                                            user_id: req.user.id
                                        },
                                        data: {
                                            refundStorage: newRefundDeBalance
                                        }
                                    })
                                    await db.dailyCashBack.create({
                                        data: {
                                            user_id: req.user.id,
                                            amount: getStep.step
                                        }
                                    })

                                    let notify = {
                                        userFirstName: req.user.firstName,
                                        reciever: req.user.id,
                                        sender: 0,
                                        postId: 0,
                                        user: req.user.id,
                                        amount: getStep.step,
                                        type: 1000,
                                        taps: 1,
                                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                    }

                                    sendNotification(notify, req.user.id)

                                    cashBackNotification(notify)

                                    return res.status(200).send('No CashBack found but provider effected')
                                }
                            }
                        }
                    }
                } else {

                    console.log('it should go here ')
                    let getStorage = await db.cashBackStorage.findFirst({});

                    if (request == 2) {
                        let call = getStorage.callCashBack
                        if (parseInt(call) <= 0) {
                            console.log(2000)
                            let newRefundDeBalanceWithoutCallStorage = parseInt(req.user.Wallet.refundStorage)
                                - parseInt(getStep.step)

                            await db.wallet.update({
                                where: {
                                    user_id: req.user.id
                                },
                                data: {
                                    refundStorage: newRefundDeBalanceWithoutCallStorage
                                }
                            })
                            await db.dailyCashBack.create({
                                data: {
                                    user_id: req.user.id,
                                    amount: totalCalcu
                                }
                            })

                            return res.status(200).send('NO CashBack found');
                        } else {
                            if (parseInt(call) - parseInt(getStep.step) >= 0) {
                                await db.cashBackStorage.update({
                                    where: {
                                        id: 1
                                    }, data: {
                                        callCashBack: "" + parseInt(getStorage.callCashBack) - parseInt(getStep.step) + ""
                                    }
                                })

                                await db.wallet.update({
                                    where: {
                                        user_id: req.user.id
                                    },
                                    data: {
                                        refundStorage: newRefundDeBalance
                                    }
                                })
                                await db.dailyCashBack.create({
                                    data: {
                                        user_id: req.user.id,
                                        amount: getStep.step
                                    }
                                })

                                let notify = {
                                    userFirstName: req.user.firstName,
                                    reciever: req.user.id,
                                    sender: 0,
                                    postId: 0,
                                    user: req.user.id,
                                    amount: getStep.step,
                                    type: 1000,
                                    taps: 1,
                                    notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                    notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                }

                                sendNotification(notify, req.user.id)

                                cashBackNotification(notify)

                                return res.status(200).send('only cashBack effected  ,Thanks.')
                            } else {

                                await db.cashBackStorage.update({
                                    where: {
                                        id: 1
                                    }, data: {
                                        callCashBack: "0"
                                    }
                                })

                                await db.wallet.update({
                                    where: {
                                        user_id: req.user.id
                                    },
                                    data: {
                                        refundStorage: parseInt(req.user.Wallet.refundStorage) - parseInt(call)
                                    }
                                })
                                await db.dailyCashBack.create({
                                    data: {
                                        user_id: req.user.id,
                                        amount: getStep.step
                                    }
                                })

                                let notify = {
                                    userFirstName: req.user.firstName,
                                    reciever: req.user.id,
                                    sender: 0,
                                    postId: 0,
                                    user: req.user.id,
                                    amount: getStep.step,
                                    type: 1000,
                                    taps: 1,
                                    notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                    notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                }

                                sendNotification(notify, req.user.id)

                                cashBackNotification(notify)

                                return res.status(200).send('call cashStorage effected with lower value')
                            }
                        }
                    } else if (request == 1) {
                        let request = getStorage.requestCashBack
                        if (parseInt(request) <= 0) {
                            console.log(2000)
                            let newRefundDeBalanceWithoutCallStorage = parseInt(req.user.Wallet.refundStorage)
                                - parseInt(getStep.step)

                            await db.wallet.update({
                                where: {
                                    user_id: req.user.id
                                },
                                data: {
                                    refundStorage: newRefundDeBalanceWithoutCallStorage
                                }
                            })
                            await db.dailyCashBack.create({
                                data: {
                                    user_id: req.user.id,
                                    amount: totalCalcu
                                }
                            })

                            return res.status(200).send('NO CashBack found');
                        } else {
                            if (parseInt(request) - parseInt(getStep.step) >= 0) {
                                await db.cashBackStorage.update({
                                    where: {
                                        id: 1
                                    }, data: {
                                        requestCashBack: "" + parseInt(getStorage.requestCashBack) - parseInt(getStep.step) + ""
                                    }
                                })

                                await db.wallet.update({
                                    where: {
                                        user_id: req.user.id
                                    },
                                    data: {
                                        refundStorage: newRefundDeBalance
                                    }
                                })
                                await db.dailyCashBack.create({
                                    data: {
                                        user_id: req.user.id,
                                        amount: getStep.step
                                    }
                                })

                                let notify = {
                                    userFirstName: req.user.firstName,
                                    reciever: req.user.id,
                                    sender: 0,
                                    postId: 0,
                                    user: req.user.id,
                                    amount: getStep.step,
                                    type: 1000,
                                    taps: 1,
                                    notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                    notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                }

                                sendNotification(notify, req.user.id)

                                cashBackNotification(notify)

                                return res.status(200).send('only cashBack effected  ,Thanks.')
                            } else {

                                await db.cashBackStorage.update({
                                    where: {
                                        id: 1
                                    }, data: {
                                        requestCashBack: "0"
                                    }
                                })

                                await db.wallet.update({
                                    where: {
                                        user_id: req.user.id
                                    },
                                    data: {
                                        refundStorage: parseInt(req.user.Wallet.refundStorage) - parseInt(request)
                                    }
                                })
                                await db.dailyCashBack.create({
                                    data: {
                                        user_id: req.user.id,
                                        amount: getStep.step
                                    }
                                })

                                let notify = {
                                    userFirstName: req.user.firstName,
                                    reciever: req.user.id,
                                    sender: 0,
                                    postId: 0,
                                    user: req.user.id,
                                    amount: getStep.step,
                                    type: 1000,
                                    taps: 1,
                                    notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                    notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                }

                                sendNotification(notify, req.user.id)

                                cashBackNotification(notify)

                                return res.status(200).send('call cashStorage effected with lower value')
                            }
                        }
                    } else if (request == 3) {
                        let any = getStorage.anyCashBack
                        if (parseInt(any) <= 0) {
                            console.log(2000)
                            let newRefundDeBalanceWithoutCallStorage = parseInt(req.user.Wallet.refundStorage)
                                - parseInt(getStep.step)

                            await db.wallet.update({
                                where: {
                                    user_id: req.user.id
                                },
                                data: {
                                    refundStorage: newRefundDeBalanceWithoutCallStorage
                                }
                            })
                            await db.dailyCashBack.create({
                                data: {
                                    user_id: req.user.id,
                                    amount: totalCalcu
                                }
                            })

                            return res.status(200).send('NO CashBack found');
                        } else {
                            if (parseInt(any) - parseInt(getStep.step) >= 0) {
                                await db.cashBackStorage.update({
                                    where: {
                                        id: 1
                                    }, data: {
                                        anyCashBack: "" + parseInt(getStorage.anyCashBack) - parseInt(getStep.step) + ""
                                    }
                                })

                                await db.wallet.update({
                                    where: {
                                        user_id: req.user.id
                                    },
                                    data: {
                                        refundStorage: newRefundDeBalance
                                    }
                                })
                                await db.dailyCashBack.create({
                                    data: {
                                        user_id: req.user.id,
                                        amount: getStep.step
                                    }
                                })

                                let notify = {
                                    userFirstName: req.user.firstName,
                                    reciever: req.user.id,
                                    sender: 0,
                                    postId: 0,
                                    user: req.user.id,
                                    amount: getStep.step,
                                    type: 1000,
                                    taps: 1,
                                    notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                    notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                }

                                sendNotification(notify, req.user.id)

                                cashBackNotification(notify)

                                return res.status(200).send('only cashBack effected  ,Thanks.')
                            } else {

                                await db.cashBackStorage.update({
                                    where: {
                                        id: 1
                                    }, data: {
                                        anyCashBack: "0"
                                    }
                                })

                                await db.wallet.update({
                                    where: {
                                        user_id: req.user.id
                                    },
                                    data: {
                                        refundStorage: parseInt(req.user.Wallet.refundStorage) - parseInt(any)
                                    }
                                })
                                await db.dailyCashBack.create({
                                    data: {
                                        user_id: req.user.id,
                                        amount: getStep.step
                                    }
                                })

                                let notify = {
                                    userFirstName: req.user.firstName,
                                    reciever: req.user.id,
                                    sender: 0,
                                    postId: 0,
                                    user: req.user.id,
                                    amount: getStep.step,
                                    type: 1000,
                                    taps: 1,
                                    notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                    notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                }

                                sendNotification(notify, req.user.id)

                                cashBackNotification(notify)

                                return res.status(200).send('call cashStorage effected with lower value')
                            }
                        }
                    }
                }
            } else {
                // check for if the first time of the day using this feater 
                // timer code is missing

                console.log('goes here')

                let isFirstStep = await db.dailyCashBack.findFirst({
                    where: {
                        user_id: req.user.id,
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                })

                if (isFirstStep) {
                    if (dayjs().startOf('day').$d > dayjs(isFirstStep.created_at).$d) {
                        var isNewest = false
                    } else {
                        var isNewest = true
                    }
                } else {
                    var isNewest = false
                }

                if (isNewest == true) {

                    console.log('its a brand new request today')
                    console.log('yes', req.user.providerCashBack)
                    if (parseInt(req.user.providerCashBack) > 0) {
                        if (parseInt(req.user.providerCashBack) - parseInt(getStep.step) >= 0) {
                            await db.users.update({
                                where: {
                                    id: req.user.id
                                },
                                data: {
                                    providerCashBack: parseInt(req.user.providerCashBack) - parseInt(getStep.step)
                                }
                            })

                            await db.wallet.update({
                                where: {
                                    user_id: req.user.id,
                                },
                                data: {
                                    refundStorage: newRefundDeBalance
                                }
                            })

                            await db.dailyCashBack.create({
                                data: {
                                    user_id: req.user.id,
                                    amount: getStep.step
                                }
                            })

                            return res.status(200).send('ok');
                        } else {
                            console.log('please')
                            let getStorage = await db.cashBackStorage.findFirst({});
                            if (parseInt(req.user.providerCashBack) < 0) {
                                console.log(10000)
                                var getCurrentProviderCashBack = 0
                            } else {
                                console.log('here')
                                var getCurrentProviderCashBack = req.user.providerCashBack
                            }

                            let totalCalcu = parseInt(getStep.step) - parseInt(getCurrentProviderCashBack)

                            await db.users.update({
                                where: {
                                    id: req.user.id
                                },
                                data: {
                                    providerCashBack: 0
                                }
                            })

                            if (request == 2) {
                                let call = getStorage.callCashBack
                                if (parseInt(call) <= 0) {
                                    console.log(2000)
                                    let newRefundDeBalanceWithoutCallStorage = parseInt(req.user.Wallet.refundStorage)
                                        - parseInt(totalCalcu)

                                    await db.wallet.update({
                                        where: {
                                            user_id: req.user.id
                                        },
                                        data: {
                                            refundStorage: newRefundDeBalanceWithoutCallStorage
                                        }
                                    })
                                    await db.dailyCashBack.create({
                                        data: {
                                            user_id: req.user.id,
                                            amount: totalCalcu
                                        }
                                    })

                                    return res.status(200).send('NO CashBack found');
                                } else {
                                    if (parseInt(call) - parseInt(totalCalcu) >= 0) {
                                        console.log(1000)
                                        await db.cashBackStorage.update({
                                            where: {
                                                id: 1
                                            }, data: {
                                                callCashBack: "" + parseInt(getStorage.callCashBack) - parseInt(totalCalcu) + ""
                                            }
                                        })

                                        await db.wallet.update({
                                            where: {
                                                user_id: req.user.id
                                            },
                                            data: {
                                                refundStorage: newRefundDeBalance
                                            }
                                        })
                                        await db.dailyCashBack.create({
                                            data: {
                                                user_id: req.user.id,
                                                amount: parseInt(getStep.step)
                                            }
                                        })

                                        let notify = {
                                            userFirstName: req.user.firstName,
                                            reciever: req.user.id,
                                            sender: 0,
                                            postId: 0,
                                            user: req.user.id,
                                            amount: getStep.step,
                                            type: 1000,
                                            taps: 1,
                                            notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                            notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                        }

                                        sendNotification(notify, req.user.id)

                                        cashBackNotification(notify)

                                        return res.send('5565')
                                    } else {
                                        console.log(5)
                                        await db.cashBackStorage.update({
                                            where: {
                                                id: 1
                                            }, data: {
                                                callCashBack: "0"
                                            }
                                        })

                                        await db.wallet.update({
                                            where: {
                                                user_id: req.user.id
                                            },
                                            data: {
                                                refundStorage: newRefundDeBalance
                                            }
                                        })
                                        await db.dailyCashBack.create({
                                            data: {
                                                user_id: req.user.id,
                                                amount: getStep.step
                                            }
                                        })

                                        let notify = {
                                            userFirstName: req.user.firstName,
                                            reciever: req.user.id,
                                            sender: 0,
                                            postId: 0,
                                            user: req.user.id,
                                            amount: getStep.step,
                                            type: 1000,
                                            taps: 1,
                                            notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                            notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                        }

                                        sendNotification(notify, req.user.id)

                                        cashBackNotification(notify)
                                    }
                                }
                            } else if (request == 1) {
                                let requestcb = getStorage.requestCashBack
                                if (parseInt(requestcb) <= 0) {
                                    console.log(2000)
                                    let newRefundDeBalanceWithoutCallStorage = parseInt(req.user.Wallet.refundStorage)
                                        - parseInt(totalCalcu)

                                    await db.wallet.update({
                                        where: {
                                            user_id: req.user.id
                                        },
                                        data: {
                                            refundStorage: newRefundDeBalanceWithoutCallStorage
                                        }
                                    })
                                    await db.dailyCashBack.create({
                                        data: {
                                            user_id: req.user.id,
                                            amount: totalCalcu
                                        }
                                    })



                                    return res.status(200).send('NO CashBack found');
                                } else {
                                    if (parseInt(requestcb) - parseInt(totalCalcu) >= 0) {
                                        console.log(1000)
                                        await db.cashBackStorage.update({
                                            where: {
                                                id: 1
                                            }, data: {
                                                callCashBack: "" + parseInt(getStorage.requestCashBack) - parseInt(totalCalcu) + ""
                                            }
                                        })

                                        await db.wallet.update({
                                            where: {
                                                user_id: req.user.id
                                            },
                                            data: {
                                                refundStorage: newRefundDeBalance
                                            }
                                        })
                                        await db.dailyCashBack.create({
                                            data: {
                                                user_id: req.user.id,
                                                amount: parseInt(getStep.step)
                                            }
                                        })

                                        let notify = {
                                            userFirstName: req.user.firstName,
                                            reciever: req.user.id,
                                            sender: 0,
                                            postId: 0,
                                            user: req.user.id,
                                            amount: getStep.step,
                                            type: 1000,
                                            taps: 1,
                                            notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                            notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                        }

                                        sendNotification(notify, req.user.id)

                                        cashBackNotification(notify)

                                        return res.send('4434322')
                                    } else {
                                        console.log(5)
                                        await db.cashBackStorage.update({
                                            where: {
                                                id: 1
                                            }, data: {
                                                callCashBack: "0"
                                            }
                                        })

                                        await db.wallet.update({
                                            where: {
                                                user_id: req.user.id
                                            },
                                            data: {
                                                refundStorage: newRefundDeBalance
                                            }
                                        })
                                        await db.dailyCashBack.create({
                                            data: {
                                                user_id: req.user.id,
                                                amount: getStep.step
                                            }
                                        })

                                        let notify = {
                                            userFirstName: req.user.firstName,
                                            reciever: req.user.id,
                                            sender: 0,
                                            postId: 0,
                                            user: req.user.id,
                                            amount: getStep.step,
                                            type: 1000,
                                            taps: 1,
                                            notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                            notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                        }

                                        sendNotification(notify, req.user.id)

                                        cashBackNotification(notify)

                                        return res.send('1122112')
                                    }
                                }
                            } else if (request == 3) {
                                let any = getStorage.anyCashBack
                                if (parseInt(any) <= 0) {
                                    console.log(2000)
                                    let newRefundDeBalanceWithoutCallStorage = parseInt(req.user.Wallet.refundStorage)
                                        - parseInt(totalCalcu)

                                    await db.wallet.update({
                                        where: {
                                            user_id: req.user.id
                                        },
                                        data: {
                                            refundStorage: newRefundDeBalanceWithoutCallStorage
                                        }
                                    })
                                    await db.dailyCashBack.create({
                                        data: {
                                            user_id: req.user.id,
                                            amount: totalCalcu
                                        }
                                    })

                                    return res.status(200).send('NO CashBack found');
                                } else {
                                    if (parseInt(any) - parseInt(totalCalcu) >= 0) {
                                        console.log(1000)
                                        await db.cashBackStorage.update({
                                            where: {
                                                id: 1
                                            }, data: {
                                                anyCashBack: "" + parseInt(getStorage.anyCashBack) - parseInt(totalCalcu) + ""
                                            }
                                        })

                                        await db.wallet.update({
                                            where: {
                                                user_id: req.user.id
                                            },
                                            data: {
                                                refundStorage: newRefundDeBalance
                                            }
                                        })
                                        await db.dailyCashBack.create({
                                            data: {
                                                user_id: req.user.id,
                                                amount: parseInt(getStep.step)
                                            }
                                        })

                                        let notify = {
                                            userFirstName: req.user.firstName,
                                            reciever: req.user.id,
                                            sender: 0,
                                            postId: 0,
                                            user: req.user.id,
                                            amount: getStep.step,
                                            type: 1000,
                                            taps: 1,
                                            notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                            notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                        }

                                        sendNotification(notify, req.user.id)

                                        cashBackNotification(notify)

                                        return res.send('443312')

                                    } else {
                                        console.log(5)
                                        await db.cashBackStorage.update({
                                            where: {
                                                id: 1
                                            }, data: {
                                                anyCashBack: "0"
                                            }
                                        })

                                        await db.wallet.update({
                                            where: {
                                                user_id: req.user.id
                                            },
                                            data: {
                                                refundStorage: newRefundDeBalance
                                            }
                                        })
                                        await db.dailyCashBack.create({
                                            data: {
                                                user_id: req.user.id,
                                                amount: getStep.step
                                            }
                                        })

                                        let notify = {
                                            userFirstName: req.user.firstName,
                                            reciever: req.user.id,
                                            sender: 0,
                                            postId: 0,
                                            user: req.user.id,
                                            amount: getStep.step,
                                            type: 1000,
                                            taps: 1,
                                            notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                            notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                        }

                                        sendNotification(notify, req.user.id)

                                        cashBackNotification(notify)

                                        return res.send('99000')
                                    }
                                }
                            }
                        }
                    } else {
                        console.log(3)
                        let getStorage = await db.cashBackStorage.findFirst({});
                        let getStep = await db.cashBackStep.findFirst({})
                        if (request == 2) {
                            let call = getStorage.callCashBack
                            if (parseInt(call) <= 0) {

                                await db.wallet.update({
                                    where: {
                                        user_id: req.user.id
                                    },
                                    data: {
                                        refundStorage: newRefundSumBalance,
                                        balance: "" + newBalanceSum + "",
                                        FreeClicksStorage: parseInt(req.user.Wallet.FreeClicksStorage) + parseInt(getStep.step)
                                    }
                                })
                                await db.dailyCashBack.create({
                                    data: {
                                        user_id: req.user.id,
                                        amount: getStep.step
                                    }
                                })

                                let notify = {
                                    userFirstName: req.user.firstName,
                                    reciever: req.user.id,
                                    sender: 0,
                                    postId: 0,
                                    user: req.user.id,
                                    amount: getStep.step,
                                    type: 1000,
                                    taps: 1,
                                    notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                    notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                }

                                sendNotification(notify, req.user.id)

                                cashBackNotification(notify)

                                return res.status(200).send('45454');
                            } else {
                                if (parseInt(call) - parseInt(getStep.step) >= 0) {
                                    await db.cashBackStorage.update({
                                        where: {
                                            id: 1
                                        }, data: {
                                            callCashBack: "" + parseInt(getStorage.callCashBack) - parseInt(getStep.step) + ""
                                        }
                                    })

                                    await db.wallet.update({
                                        where: {
                                            user_id: req.user.id
                                        },
                                        data: {
                                            refundStorage: newRefundDeBalance
                                        }
                                    })
                                    await db.dailyCashBack.create({
                                        data: {
                                            user_id: req.user.id,
                                            amount: getStep.step
                                        }
                                    })

                                    let notify = {
                                        userFirstName: req.user.firstName,
                                        reciever: req.user.id,
                                        sender: 0,
                                        postId: 0,
                                        user: req.user.id,
                                        amount: getStep.step,
                                        type: 1000,
                                        taps: 1,
                                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                    }

                                    sendNotification(notify, req.user.id)

                                    cashBackNotification(notify)

                                    return res.send('1212')
                                } else {
                                    console.log(4)
                                    await db.cashBackStorage.update({
                                        where: {
                                            id: 1
                                        }, data: {
                                            callCashBack: "0"
                                        }
                                    })

                                    await db.wallet.update({
                                        where: {
                                            user_id: req.user.id
                                        },
                                        data: {
                                            refundStorage: newRefundDeBalance
                                        }
                                    })
                                    await db.dailyCashBack.create({
                                        data: {
                                            user_id: req.user.id,
                                            amount: getStep.step
                                        }
                                    })

                                    let notify = {
                                        userFirstName: req.user.firstName,
                                        reciever: req.user.id,
                                        sender: 0,
                                        postId: 0,
                                        user: req.user.id,
                                        amount: getStep.step,
                                        type: 1000,
                                        taps: 1,
                                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                    }

                                    sendNotification(notify, req.user.id)

                                    cashBackNotification(notify)

                                    return res.send('2321')
                                }
                            }
                        } else if (request == 1) {
                            let requestcb = getStorage.requestCashBack
                            let getStep = await db.cashBackStep.findFirst({})
                            if (parseInt(requestcb) <= 0) {

                                await db.wallet.update({
                                    where: {
                                        user_id: req.user.id
                                    },
                                    data: {
                                        refundStorage: newRefundSumBalance,
                                        balance: "" + newBalanceSum + "",
                                        FreeClicksStorage: parseInt(req.user.Wallet.FreeClicksStorage) + parseInt(getStep.step)
                                    }
                                })
                                await db.dailyCashBack.create({
                                    data: {
                                        user_id: req.user.id,
                                        amount: getStep.step
                                    }
                                })

                                let notify = {
                                    userFirstName: req.user.firstName,
                                    reciever: req.user.id,
                                    sender: 0,
                                    postId: 0,
                                    user: req.user.id,
                                    amount: getStep.step,
                                    type: 1000,
                                    taps: 1,
                                    notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                    notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                }

                                sendNotification(notify, req.user.id)

                                cashBackNotification(notify)

                                return res.status(200).send('454232354');

                            } else {
                                if (parseInt(requestcb) - parseInt(getStep.step) >= 0) {
                                    await db.cashBackStorage.update({
                                        where: {
                                            id: 1
                                        }, data: {
                                            requestCashBack: "" + parseInt(getStorage.requestCashBack) - parseInt(getStep.step) + ""
                                        }
                                    })

                                    await db.wallet.update({
                                        where: {
                                            user_id: req.user.id
                                        },
                                        data: {
                                            refundStorage: newRefundDeBalance
                                        }
                                    })
                                    await db.dailyCashBack.create({
                                        data: {
                                            user_id: req.user.id,
                                            amount: getStep.step
                                        }
                                    })

                                    let notify = {
                                        userFirstName: req.user.firstName,
                                        reciever: req.user.id,
                                        sender: 0,
                                        postId: 0,
                                        user: req.user.id,
                                        amount: getStep.step,
                                        type: 1000,
                                        taps: 1,
                                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                    }

                                    sendNotification(notify, req.user.id)

                                    cashBackNotification(notify)

                                    return res.send('23313')
                                } else {
                                    console.log(4)
                                    await db.cashBackStorage.update({
                                        where: {
                                            id: 1
                                        }, data: {
                                            requestCashBack: "0"
                                        }
                                    })

                                    await db.wallet.update({
                                        where: {
                                            user_id: req.user.id
                                        },
                                        data: {
                                            refundStorage: newRefundDeBalance
                                        }
                                    })
                                    await db.dailyCashBack.create({
                                        data: {
                                            user_id: req.user.id,
                                            amount: getStep.step
                                        }
                                    })

                                    let notify = {
                                        userFirstName: req.user.firstName,
                                        reciever: req.user.id,
                                        sender: 0,
                                        postId: 0,
                                        user: req.user.id,
                                        amount: getStep.step,
                                        type: 1000,
                                        taps: 1,
                                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                    }

                                    sendNotification(notify, req.user.id)

                                    cashBackNotification(notify)

                                    return res.send('22223332')
                                }
                            }
                        } else if (request == 3) {
                            let any = getStorage.anyCashBack
                            let getStep = await db.cashBackStep.findFirst({})
                            if (parseInt(any) <= 0) {
                                await db.wallet.update({
                                    where: {
                                        user_id: req.user.id
                                    },
                                    data: {
                                        refundStorage: newRefundSumBalance,
                                        balance: "" + newBalanceSum + "",
                                        FreeClicksStorage: parseInt(req.user.Wallet.FreeClicksStorage) + parseInt(getStep.step)
                                    }
                                })
                                await db.dailyCashBack.create({
                                    data: {
                                        user_id: req.user.id,
                                        amount: getStep.step
                                    }
                                })

                                let notify = {
                                    userFirstName: req.user.firstName,
                                    reciever: req.user.id,
                                    sender: 0,
                                    postId: 0,
                                    user: req.user.id,
                                    amount: getStep.step,
                                    type: 1000,
                                    taps: 1,
                                    notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                    notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                }

                                sendNotification(notify, req.user.id)

                                cashBackNotification(notify)

                                return res.status(200).send('4542332323254');
                            } else {
                                if (parseInt(any) - parseInt(getStep.step) >= 0) {
                                    await db.cashBackStorage.update({
                                        where: {
                                            id: 1
                                        }, data: {
                                            anyCashBack: "" + parseInt(getStorage.anyCashBack) - parseInt(getStep.step) + ""
                                        }
                                    })

                                    await db.wallet.update({
                                        where: {
                                            user_id: req.user.id
                                        },
                                        data: {
                                            refundStorage: newRefundDeBalance
                                        }
                                    })
                                    await db.dailyCashBack.create({
                                        data: {
                                            user_id: req.user.id,
                                            amount: getStep.step
                                        }
                                    })

                                    let notify = {
                                        userFirstName: req.user.firstName,
                                        reciever: req.user.id,
                                        sender: 0,
                                        postId: 0,
                                        user: req.user.id,
                                        amount: getStep.step,
                                        type: 1000,
                                        taps: 1,
                                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                    }

                                    sendNotification(notify, req.user.id)

                                    cashBackNotification(notify)

                                    return res.send('8888')
                                } else {
                                    console.log(4)
                                    await db.cashBackStorage.update({
                                        where: {
                                            id: 1
                                        }, data: {
                                            anyCashBack: "0"
                                        }
                                    })

                                    await db.wallet.update({
                                        where: {
                                            user_id: req.user.id
                                        },
                                        data: {
                                            refundStorage: newRefundDeBalance
                                        }
                                    })
                                    await db.dailyCashBack.create({
                                        data: {
                                            user_id: req.user.id,
                                            amount: getStep.step
                                        }
                                    })

                                    let notify = {
                                        userFirstName: req.user.firstName,
                                        reciever: req.user.id,
                                        sender: 0,
                                        postId: 0,
                                        user: req.user.id,
                                        amount: getStep.step,
                                        type: 1000,
                                        taps: 1,
                                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                                    }

                                    sendNotification(notify, req.user.id)

                                    cashBackNotification(notify)

                                    return res.send('556655')
                                }
                            }
                        }
                    }
                } else {
                    await db.wallet.update({
                        where: {
                            user_id: req.user.id
                        },
                        data: {
                            refundStorage: newRefundSumBalance,
                            balance: "" + newBalanceSum + "",
                            FreeClicksStorage: parseInt(req.user.Wallet.FreeClicksStorage) + parseInt(getStep.step)
                        }
                    })
                    await db.dailyCashBack.create({
                        data: {
                            user_id: req.user.id,
                            amount: getStep.step
                        }
                    })

                    let notify = {
                        userFirstName: req.user.firstName,
                        reciever: req.user.id,
                        sender: 0,
                        postId: 0,
                        user: req.user.id,
                        amount: getStep.step,
                        type: 1000,
                        taps: 1,
                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                    }

                    sendNotification(notify, req.user.id)

                    cashBackNotification(notify)

                    return res.send('8867')
                }
            }
        } else {
            // check if you got a ref with you
            if (parseInt(req.user.Wallet.refPayBack) < 10 && getMyinvitor) {
                console.log('passed 2')
                await db.wallet.update({
                    where: {
                        user_id: req.user.id
                    },
                    data: {
                        balance: (parseInt(req.user.Wallet.balance) - 10).toString(),
                        refPayBack: 10,
                    }
                })

                if (parseInt(getRefUser.Wallet.refundStorage) > 0) {
                    console.log('passed 3')
                    if (parseInt(getRefUser.Wallet.refundStorage) - 10 >= 0) {
                        await db.wallet.update({
                            where: {
                                user_id: getRefUser.id
                            },
                            data: {
                                refundStorage: (parseInt(getRefUser.Wallet.refundStorage) - 10).toString()
                            }
                        })
                    } else {
                        console.log('passed 4')
                        let finalCalcu = 10 - parseInt(getRefUser.Wallet.refundStorage)
                        await db.wallet.update({
                            where: {
                                user_id: getRefUser.id
                            },
                            data: {
                                balance: (parseInt(getRefUser.Wallet.balance) + finalCalcu).toString(),
                                refundStorage: 0,
                            }
                        })
                    }

                    let notify = {
                        userFirstName: req.user.firstName,
                        reciever: getMyinvitor.inviter,
                        sender: 0,
                        postId: 0,
                        user: req.user.id,
                        amount: getStep.step,
                        type: 1000,
                        taps: 1,
                        notification_en: `You have got ${getStep.step} as cashback for sharing from 49.`,
                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                    }

                    sendNotification(notify, req.user.id)

                    cashBackNotification(notify)

                    return res.status(200).send('ref got the money');
                } else {
                    console.log('passed 5')
                    await db.wallet.update({
                        where: {
                            user_id: getRefUser.id
                        },
                        data: {
                            balance: (parseInt(getRefUser.Wallet.balance) + 10).toString()
                        }
                    })

                    let notify = {
                        userFirstName: req.user.firstName,
                        reciever: getMyinvitor.inviter,
                        sender: 0,
                        postId: 0,
                        user: req.user.id,
                        amount: getStep.step,
                        type: 1000,
                        taps: 1,
                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                    }

                    sendNotification(notify, req.user.id)

                    cashBackNotification(notify)

                    return res.status(200).send('ref got money in balance');
                }
            }

            if (req.user.providerCashBack > 0) {
                if (parseInt(req.user.providerCashBack) - parseInt(getStep.step) >= 0) {
                    await db.users.update({
                        where: {
                            id: req.user.id
                        },
                        data: {
                            providerCashBack: parseInt(req.user.providerCashBack) - parseInt(getStep.step)
                        }
                    })


                    await db.wallet.update({
                        where: {
                            user_id: req.user.id
                        },
                        data: {
                            balance: (parseInt(req.user.Wallet.balance) + parseInt(getStep.step)).toString()
                        }
                    })


                    await db.dailyCashBack.create({
                        data: {
                            user_id: req.user.id,
                            amount: getStep.step
                        }
                    })

                    let notify = {
                        userFirstName: req.user.firstName,
                        reciever: req.user.id,
                        sender: 0,
                        postId: 0,
                        user: req.user.id,
                        amount: getStep.step,
                        type: 1000,
                        taps: 1,
                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                    }

                    sendNotification(notify, req.user.id)

                    cashBackNotification(notify)

                    return res.status(200).send('You got money from provider cashback')
                } else {
                    let finalAmount = req.user.providerCashBack
                    await db.users.update({
                        where: {
                            id: req.user.id
                        },
                        data: {
                            providerCashBack: 0
                        }
                    })

                    if (request == 2) {
                        var getCashBackStorage = (await db.cashBackStorage.findFirst({})).callCashBack
                    } else if (request == 1) {
                        var getCashBackStorage = (await db.cashBackStorage.findFirst({})).requestCashBack
                    } else if (request == 3) {
                        var getCashBackStorage = (await db.cashBackStorage.findFirst({})).anyCashBack
                    }

                    if (parseInt(getCashBackStorage) <= 0) {
                        await db.wallet.update({
                            where: {
                                user_id: req.user.id
                            },
                            data: {
                                balance: (parseInt(req.user.Wallet.balance) + parseInt(finalAmount)).toString()
                            }
                        })
                        await db.dailyCashBack.create({
                            data: {
                                user_id: req.user.id,
                                amount: finalAmount
                            }
                        })

                        let notify = {
                            userFirstName: req.user.firstName,
                            reciever: req.user.id,
                            sender: 0,
                            postId: 0,
                            user: req.user.id,
                            amount: finalAmount,
                            type: 1000,
                            taps: 1,
                            notification_en: `You have got ${getStep.step} as cashback from 49.`,
                            notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                        }

                        sendNotification(notify, req.user.id)

                        cashBackNotification(notify)

                        return res.status(200).send('You got some money from provider cashback')
                    } else {
                        let finalAmount = req.user.providerCashBack
                        let remainingProviderCashBack = parseInt(getStep.step) - parseInt(finalAmount)

                        if (request == 2) {
                            var getCashBackStorage = (await db.cashBackStorage.findFirst({})).callCashBack
                        } else if (request == 1) {
                            var getCashBackStorage = (await db.cashBackStorage.findFirst({})).requestCashBack
                        } else if (request == 3) {
                            var getCashBackStorage = (await db.cashBackStorage.findFirst({})).anyCashBack
                        }

                        if (parseInt(getCashBackStorage) - parseInt(remainingProviderCashBack) >= 0) {
                            await db.cashBackStorage.update({
                                where: {
                                    id: 1
                                },
                                data: {
                                    callCashBack: request == 2 ? (parseInt(getCashBackStorage) - parseInt(remainingProviderCashBack)).toString() : undefined,
                                    requestCashBack: request == 1 ? (parseInt(getCashBackStorage) - parseInt(remainingProviderCashBack)).toString() : undefined,
                                    anyCashBack: request == 3 ? (parseInt(getCashBackStorage) - parseInt(remainingProviderCashBack)).toString() : undefined,
                                }
                            })
                            await db.wallet.update({
                                where: {
                                    user_id: req.user.id
                                },
                                data: {
                                    balance: (parseInt(req.user.Wallet.balance) + parseInt(getStep.step)).toString()
                                }
                            })
                            await db.dailyCashBack.create({
                                data: {
                                    user_id: req.user.id,
                                    amount: finalAmount
                                }
                            })


                            let notify = {
                                userFirstName: req.user.firstName,
                                reciever: req.user.id,
                                sender: 0,
                                postId: 0,
                                user: req.user.id,
                                amount: finalAmount,
                                type: 1000,
                                taps: 1,
                                notification_en: `You have got ${getStep.step} as cashback from 49.`,
                                notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                            }

                            sendNotification(notify, req.user.id)

                            cashBackNotification(notify)

                            return res.status(200).send('ok');

                        } else {

                            if (request == 2) {
                                var remainCallCashBack = (await db.cashBackStorage.findFirst({})).callCashBack
                            } else if (request == 1) {
                                var remainCallCashBack = (await db.cashBackStorage.findFirst({})).requestCashBack
                            } else if (request == 3) {
                                var remainCallCashBack = (await db.cashBackStorage.findFirst({})).anyCashBack
                            }

                            await db.wallet.update({
                                where: {
                                    user_id: req.user.id
                                },
                                data: {
                                    balance: (parseInt(req.user.Wallet.balance) + parseInt(finalAmount) + parseInt(remainCallCashBack)).toString()
                                }
                            })

                            await db.cashBackStorage.update({
                                where: {
                                    id: 1
                                },
                                data: {
                                    callCashBack: request == 2 ? "0" : undefined,
                                    requestCashBack: request == 1 ? "0" : undefined,
                                    anyCashBack: request == 3 ? "0" : undefined,
                                }
                            })

                            await db.dailyCashBack.create({
                                data: {
                                    user_id: req.user.id,
                                    amount: parseInt(finalAmount) + parseInt(remainCallCashBack)
                                }
                            })

                            let notify = {
                                userFirstName: req.user.firstName,
                                reciever: req.user.id,
                                sender: 0,
                                postId: 0,
                                user: req.user.id,
                                amount: finalAmount,
                                type: 1000,
                                taps: 1,
                                notification_en: `You have got ${parseInt(finalAmount) + parseInt(remainCallCashBack)} as cashback from 49.`,
                                notification_ar: `لقد حصلت علي كاش باك من ٤٩.${parseInt(finalAmount) + parseInt(remainCallCashBack)} `
                            }

                            sendNotification(notify, req.user.id)

                            cashBackNotification(notify)

                            return res.status(200).send('Money has been taken out from storage and provider')
                        }
                    }
                }
            } else {

                if (request == 2) {
                    var cashBackStorage = (await db.cashBackStorage.findFirst({})).callCashBack
                } else if (request == 1) {
                    var cashBackStorage = (await db.cashBackStorage.findFirst({})).requestCashBack
                } else if (request == 3) {
                    var cashBackStorage = (await db.cashBackStorage.findFirst({})).anyCashBack
                }

                if (parseInt(cashBackStorage) == 0) {
                    // there is no money in the cash back storage of the choosing request
                    return res.status(200).send('No cashBack storage and there is no provider cash but everything is okay')
                } else {
                    if (parseInt(cashBackStorage) - parseInt(getStep.step) >= 0) {
                        await db.cashBackStorage.update({
                            where: {
                                id: 1
                            },
                            data: {
                                callCashBack: request == 2 ? (parseInt(cashBackStorage) - parseInt(getStep.step)).toString() : undefined,
                                requestCashBack: request == 1 ? (parseInt(cashBackStorage) - parseInt(getStep.step)).toString() : undefined,
                                anyCashBack: request == 3 ? (parseInt(cashBackStorage) - parseInt(getStep.step)).toString() : undefined,
                            }
                        })

                        await db.wallet.update({
                            where: {
                                user_id: req.user.id,
                            },
                            data: {
                                balance: (parseInt(req.user.Wallet.balance) + parseInt(getStep.step)).toString()
                            }
                        })

                        await db.dailyCashBack.create({
                            data: {
                                user_id: req.user.id,
                                amount: getStep.step
                            }
                        })

                        let notify = {
                            userFirstName: req.user.firstName,
                            reciever: req.user.id,
                            sender: 0,
                            postId: 0,
                            user: req.user.id,
                            amount: getStep.step,
                            type: 1000,
                            taps: 1,
                            notification_en: `You have got ${getStep.step} as cashback from 49.`,
                            notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                        }

                        sendNotification(notify, req.user.id)

                        cashBackNotification(notify)

                        return res.status(200).send('Cash back Storage has been totally effected')
                    } else {
                        await db.cashBackStorage.update({
                            where: {
                                id: 1
                            },
                            data: {
                                callCashBack: request == 2 ? "0" : undefined,
                                requestCashBack: request == 1 ? "0" : undefined,
                                anyCashBack: request == 3 ? "0" : undefined,
                            }
                        })

                        await db.wallet.update({
                            where: {
                                user_id: req.user.id,
                            },
                            data: {
                                balance: (parseInt(req.user.Wallet.balance) + parseInt(cashBackStorage)).toString()
                            }
                        })

                        await db.dailyCashBack.create({
                            data: {
                                user_id: req.user.id,
                                amount: getStep.step
                            }
                        })

                        let notify = {
                            userFirstName: req.user.firstName,
                            reciever: req.user.id,
                            sender: 0,
                            postId: 0,
                            user: req.user.id,
                            amount: getStep.step,
                            type: 1000,
                            taps: 1,
                            notification_en: `You have got ${getStep.step} as cashback from 49.`,
                            notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                        }

                        sendNotification(notify, req.user.id)

                        cashBackNotification(notify)

                        return res.status(200).send('Cash back Storage has been not-totally effected')
                    }
                }

            }

        }

        if (req.user.providerCashBack > 0) {
            if (pasrInt(req.user.providerCashBack) - parseInt(getStep.step) >= 0) {
                await db.users.update({
                    where: {
                        id: req.user.id
                    },
                    data: {
                        providerCashBack: parseInt(req.user.providerCashBack) - parseInt(getStep.step)
                    }
                })

                await db.wallet.update({
                    where: {
                        user_id: req.user.id,
                    },
                    data: {
                        balance: "" + newBalanceSum + ""
                    }
                })

                await db.dailyCashBack.create({
                    data: {
                        user_id: req.user.id,
                        amount: getStep.step
                    }
                })

                let notify = {
                    userFirstName: req.user.firstName,
                    reciever: req.user.id,
                    sender: 0,
                    postId: 0,
                    user: req.user.id,
                    amount: getStep.step,
                    type: 1000,
                    taps: 1,
                    notification_en: `You have got ${getStep.step} as cashback from 49.`,
                    notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                }

                sendNotification(notify, req.user.id)

                cashBackNotification(notify)

                return res.send('887786');
            } else {
                let getStorage = await db.cashBackStorage.findFirst({});
                if (req.user.providerCashBack <= 0) {
                    var getCurrentProviderCashBack = 0
                } else {
                    var getCurrentProviderCashBack = req.user.providerCashBack
                }

                let totalCalcu = parseInt(getStep.step) - parseInt(getCurrentProviderCashBack)

                await db.users.update({
                    where: {
                        id: req.user.id
                    },
                    data: {
                        providerCashBack: 0
                    }
                })

                if (request == 2) {
                    var call = getStorage.callCashBack
                } else if (request == 1) {
                    var call = getStorage.requestCashBack
                } else if (request == 3) {
                    var call = getStorage.anyCashBack
                }

                if (call <= 0) {
                    return false;
                } else {
                    if (parseInt(call) - parseInt(getStep.step) >= 0) {
                        await db.cashBackStorage.update({
                            where: {
                                id: 1
                            }, data: {
                                callCashBack: request == 2 ? (parseInt(getStorage.callCashBack) - parseInt(totalCalcu)).toString() : undefined,
                                requestCashBack: request == 1 ? (parseInt(getStorage.requestCashBack) - parseInt(totalCalcu)).toString() : undefined,
                                anyCashBack: request == 3 ? (parseInt(getStorage.anyCashBack) - parseInt(totalCalcu)).toString() : undefined
                            }
                        })

                        await db.wallet.update({
                            where: {
                                user_id: req.user.id
                            },
                            data: {
                                balance: "" + newBalanceSum + ""
                            }
                        })
                        await db.dailyCashBack.create({
                            data: {
                                user_id: req.user.id,
                                amount: getStep.step
                            }
                        })

                        let notify = {
                            userFirstName: req.user.firstName,
                            reciever: req.user.id,
                            sender: 0,
                            postId: 0,
                            user: req.user.id,
                            amount: getStep.step,
                            type: 1000,
                            taps: 1,
                            notification_en: `You have got ${getStep.step} as cashback from 49.`,
                            notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                        }

                        sendNotification(notify, req.user.id)

                        cashBackNotification(notify)

                        return res.send('1111111')
                    } else {
                        await db.cashBackStorage.update({
                            where: {
                                id: 1
                            }, data: {
                                callCashBack: request == 2 ? "0" : undefined,
                                requestCashBack: request == 1 ? "0" : undefined,
                                anyCashBack: request == 3 ? "0" : undefined,
                            }
                        })

                        await db.wallet.update({
                            where: {
                                user_id: req.user.id
                            },
                            data: {
                                balance: "" + newBalanceSum + ""
                            }
                        })
                        await db.dailyCashBack.create({
                            data: {
                                user_id: req.user.id,
                                amount: getStep.step
                            }
                        })

                        let notify = {
                            userFirstName: req.user.firstName,
                            reciever: req.user.id,
                            sender: 0,
                            postId: 0,
                            user: req.user.id,
                            amount: getStep.step,
                            type: 1000,
                            taps: 1,
                            notification_en: `You have got ${getStep.step} as cashback from 49.`,
                            notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                        }

                        sendNotification(notify, req.user.id)

                        cashBackNotification(notify)

                        return res.send('778668')
                    }
                }
            }
        } else {
            let getStorage = await db.cashBackStorage.findFirst({});

            if (request == 2) {
                var call = getStorage.callCashBack
            } else if (request == 1) {
                var call = getStorage.requestCashBack
            } else if (request == 3) {
                var call = getStorage.anyCashBack
            }
            if (call <= 0) {
                return false;
            } else {
                if (parseInt(call) - parseInt(getStep.step) >= 0) {
                    await db.cashBackStorage.update({
                        where: {
                            id: 1
                        }, data: {
                            callCashBack: request == 2 ? (parseInt(getStorage.callCashBack) - parseInt(getStep.step)).toString() : undefined,
                            requestCashBack: request == 1 ? (parseInt(getStorage.requestCashBack) - parseInt(getStep.step)).toString() : undefined,
                            anyCashBack: request == 3 ? (parseInt(getStorage.anyCashBack) - parseInt(getStep.step)).toString() : undefined
                        }
                    })

                    await db.wallet.update({
                        where: {
                            user_id: req.user.id
                        },
                        data: {
                            balance: "" + newBalanceSum + ""
                        }
                    })
                    await db.dailyCashBack.create({
                        data: {
                            user_id: req.user.id,
                            amount: getStep.step
                        }
                    })

                    let notify = {
                        userFirstName: req.user.firstName,
                        reciever: req.user.id,
                        sender: 0,
                        postId: 0,
                        user: req.user.id,
                        amount: getStep.step,
                        type: 1000,
                        taps: 1,
                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                    }

                    sendNotification(notify, req.user.id)

                    cashBackNotification(notify)

                    return res.send('33232')
                } else {
                    let finalAmount = parseInt(getStep.step) - parseInt(getStorage.callCashBack)
                    await db.cashBackStorage.update({
                        where: {
                            id: 1
                        }, data: {
                            callCashBack: request == 2 ? "0" : undefined,
                            requestCashBack: request == 1 ? "0" : undefined,
                            anyCashBack: request == 3 ? "0" : undefined,
                        }
                    })

                    await db.wallet.update({
                        where: {
                            user_id: req.user.id
                        },
                        data: {
                            balance: "" + parseInt(req.user.wallet.balance) + parseInt(finalAmount) + ""
                        }
                    })
                    await db.dailyCashBack.create({
                        data: {
                            user_id: req.user.id,
                            amount: getStep.step
                        }
                    })

                    let notify = {
                        userFirstName: req.user.firstName,
                        reciever: req.user.id,
                        sender: 0,
                        postId: 0,
                        user: req.user.id,
                        amount: getStep.step,
                        type: 1000,
                        taps: 1,
                        notification_en: `You have got ${getStep.step} as cashback from 49.`,
                        notification_ar: `لقد حصلت علي كاش باك من ٤٩.${getStep.step} `
                    }

                    sendNotification(notify, req.user.id)

                    cashBackNotification(notify)
                }
            }
        }
    }

    catch (e) {
        console.log(e)
        return false
    }
}

/* Request API */
// let makeRequest = async (req, res) => {
//     const { adId } = req.body

//     if (! adId) {
//         return res.status(403).send('Ad id is not provided')
//     }

//     let CheckIfUserSendRequestBefore = await db.requests.findFirst({
//         where: {
//             user_id: req.user.id,
//             ad_id: parseInt(adId)
//         }
//     })

//     if (CheckIfUserSendRequestBefore) {
//         return res.status(403).json({
//             error: {
//                 error_en: 'Request was send before .. cannot proccess.',
//                 error_ar: 'تم ارسال الطلب سابقا.'
//             }
//         })
//     }

//     try {

//         await db.requests.create({
//             data: {
//                 user_id: req.user.id,
//                 ad_id: parseInt(adId)
//             }
//         })

//         return res.status(200).json({
//             success: {
//                 success_en: 'Ok',
//                 success_ar: 'Ok'
//             }
//         })

//     } catch (e) {
//         console.log(e)
//         return res.status(500).send(e)
//     }

// }

module.exports = {

    getSubCategoryPrices, makeSubscriptionPayments,
    withdrawMoney, chargeBalance, transferTo,
    userInfo, makeRequest

}