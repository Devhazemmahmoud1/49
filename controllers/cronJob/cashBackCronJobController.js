const CronJob = require('cron').CronJob;
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient();
const moment = require('moment')

const job = new CronJob("00 00 00 * * *", async () => {
    let totalUsers = await db.users.findMany({
        select: {
            id: true,
            recentLikes: true,
            recentShare: true,
            recentViews: true,
            posts: true,
            Wallet: true,
        },
        orderBy: {
            recentLikes: 'asc'
        }
    })

    let cashBackRe = (await db.cashBackStorage.findFirst({})).likeCashBack
    let cashBackSh = (await db.cashBackStorage.findFirst({})).shareCashBack

    // loop
    for (item of totalUsers) {
        let totalReactions = item.posts.total_reactions
        let totalShares = item.posts.total_shares
        let currentReactions = (parseInt(totalReactions) - parseInt(item.recentLikes)) 
        let currentShares = (parseInt(totalShares) - parseInt(item.recentShare)) 

        let currentReactionPerc = Math.floor(parseInt(currentReactions) / 200)

        let currentSharesPerc = Math.floor(parseInt(currentShares) / 200)

        if (parseInt(item.Wallet.refundStorage > 0) || parseInt(item.Wallet.ref < 10)) {
            continue;   
        }

        if (parseInt(currentReactionPerc) > 0) {
            if (parseInt(cashBackRe) > 0) {
                if (parseInt(cashBackRe) - parseInt(currentReactionPerc) >= 0) {
                    // update cashBack
                    await db.cashBackStorage.update({
                        where: {
                            id: 1
                        },
                        data: {
                            likeCashBack: parseInt(cashBackRe) - parseInt(currentReactionPerc)
                        }
                    })
                    // Update Wallet
                    await db.wallet.update({
                        where: {
                            user_id: item.id
                        },
                        data: {
                            balance: (parseInt(item.Wallet.balance) + parseInt(currentReactionPerc)).toString()
                        }
                    })

                    // update new reactions
                    await db.users.findFirst({
                        where: {
                            id: item.id
                        },
                        data: {
                            recentLikes: item.recentLikes + parseInt(currentReactions)
                        }
                    })

                    return res.status(200).send('you got money')
                } else {
                    await db.cashBackStorage.update({
                        where: {
                            id: 1
                        },
                        data: {
                            likeCashBack: "0"
                        }
                    })
                    // Update Wallet
                    await db.wallet.update({
                        where: {
                            user_id: item.id
                        },
                        data: {
                            balance: (parseInt(item.Wallet.balance) + parseInt(cashBackRe)).toString()
                        }
                    })

                    await db.users.findFirst({
                        where: {
                            id: item.id
                        },
                        data: {
                            recentLikes: item.recentLikes + parseInt(currentReactions)
                        }
                    })                    

                    res.status(200).send('you got money only from cashback lil')
                }
            } else {
                await db.users.findFirst({
                    where: {
                        id: item.id
                    },
                    data: {
                        recentLikes: item.recentLikes + parseInt(currentReactions)
                    }
                })

                 res.status(200).send('No OP has been taken.');    
            }
        } else {
            await db.users.findFirst({
                where: {
                    id: item.id
                },
                data: {
                    recentLikes: item.recentLikes + parseInt(currentReactions)
                }
            })

             res.status(200).send('No OP has been taken.');    
        }

        if (currentSharesPerc > 0) {
            if (parseInt(cashBackSh) > 0) {
                if (parseInt(cashBackSh) - parseInt(currentSharesPerc) >= 0) {
                    // update cashBack
                    await db.cashBackStorage.update({
                        where: {
                            id: 1
                        },
                        data: {
                            shareCashBack: parseInt(cashBackSh) - parseInt(currentSharesPerc)
                        }
                    })
                    // Update Wallet
                    await db.wallet.update({
                        where: {
                            user_id: item.id
                        },
                        data: {
                            balance: (parseInt(item.Wallet.balance) + parseInt(currentSharesPerc)).toString()
                        }
                    })
                    
                    // update new reactions
                    await db.users.findFirst({
                        where: {
                            id: item.id
                        },
                        data: {
                            recentShares: item.recentShares + parseInt(currentSharesPerc)
                        }
                    })

                    res.status(200).send('you got money')
                } else {
                    await db.cashBackStorage.update({
                        where: {
                            id: 1
                        },
                        data: {
                            shareCashBack: "0"
                        }
                    })
                    // Update Wallet
                    await db.wallet.update({
                        where: {
                            user_id: item.id
                        },
                        data: {
                            balance: (parseInt(item.Wallet.balance) + parseInt(cashBackSh)).toString()
                        }
                    })

                    await db.users.findFirst({
                        where: {
                            id: item.id
                        },
                        data: {
                            recentShares: item.recentShares + parseInt(currentSharesPerc)
                        }
                    })                    

                     res.status(200).send('you got money only from cashback lil')
                }
            } else {
                await db.users.findFirst({
                    where: {
                        id: item.id
                    },
                    data: {
                        recentLikes: parseInt(item.recentShares) + parseInt(currentSharesPerc)
                    }
                })

                res.status(200).send('No OP has been taken.');    
            }
        } else {
            await db.users.findFirst({
                where: {
                    id: item.id
                },
                data: {
                    recentLikes: item.recentShares + parseInt(currentSharesPerc)
                }
            })

            res.status(200).send('No OP has been taken.');    
        }
    }
});

job.start();
