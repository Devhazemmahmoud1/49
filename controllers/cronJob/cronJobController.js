const CronJob = require('cron').CronJob;
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient();
const moment = require('moment')

const job = new CronJob("59 * * * * *", async () => {
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

//job.start();
