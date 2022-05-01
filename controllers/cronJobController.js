const CronJob = require('cron').CronJob;
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient();
const moment = require('moment')

const job = new CronJob("59 * * * * *", async () => {
    /* let users = await db.users.findMany({})
     for (item of users) {
         let profitProfile = await db.profit.findMany({ where: { id: item.id } })
         let lastUserProfitProfile = await db.profit.findFirst({ where: { user_id: item.id }, orderBy: { created_at: 'desc' } })
         if (!lastUserProfitProfile) continue;
 
         // Checking the timer has passed a month for this user
         if (moment(lastUserProfitProfile.updated_at).add(1, 'month').format('YYYY/MM/DD HH:mm:ss') >= moment().format('YYYY/MM/DD HH:mm:ss')) {
             // a month has passed and now we have to start calculating 
             // # 1- GET the current balance from this user's wallet and start doing magic
             //var startBalance = lastUserProfitProfile.total
 
            let getIntrest = await db.appInfo.findFirst({})
             let wallet = (await db.wallet.findFirst({ where: { user_id: item.id } })).balance
             let profit = parseInt(lastUserProfitProfile.total) * getIntrest.intrest / 100 / 12
             let total =  parseInt(wallet) + profit + lastUserProfitProfile.profit
             let newBalance = parseInt(wallet) + profit
             /*
             await db.wallet.update({
                 where: {
                     user_id: item.id
                 },
                 data: {
                     balance: "" + newBalance + ""
                 }
             })
 
             await db.profit.create({
                 data: {
                     user_id: item.id,
                     startBalance: 0,
                     wallet: parseInt(wallet),
                     intest: (await db.appInfo.findFirst()).intrest,
                     profit: profit,
                     total: total
                 }
             })            
 
 
         } else {
             continue;
         }
     } */

    let users = await db.users.findMany({})
    for (item of users) {
        let profitProfile = await db.profit.findMany({ where: { id: item.id } })
        let lastUserProfitProfile = await db.profit.findFirst({ where: { user_id: item.id }, orderBy: { created_at: 'desc' } })
        let getWalletBalance = await db.wallet.findFirst({ where: { user_id: item.id } })
        let getIntrest =  (await db.appInfo.findFirst({})).intrest
        if (!lastUserProfitProfile) continue;
        if (moment(lastUserProfitProfile.updated_at).add(1, 'month').format('YYYY/MM/DD HH:mm:ss') <= moment().format('YYYY/MM/DD HH:mm:ss')) {

            let calculateProfit = lastUserProfitProfile.total * getIntrest / 100 / 12
            let calculateTotal = parseInt(lastUserProfitProfile.total + calculateProfit + getWalletBalance.startBalance)

            // Create a new profit instance
            await db.profit.create({
                data: {
                    user_id: item.id,
                    startBalance: parseInt(getWalletBalance.startBalance),
                    generatedBalance: lastUserProfitProfile.total,
                    intest: getIntrest,
                    profit: calculateProfit,
                    total: parseInt(calculateTotal)
                }
            })

            console.log(parseInt(getWalletBalance.startBalance), lastUserProfitProfile.total)
            console.log(calculateProfit, calculateTotal)

            await db.wallet.update({
                where: {
                    user_id: item.id
                },
                data: {
                    startBalance: "0"
                }
            })
        } else {
            continue;
        }
    }

});

job.start();
