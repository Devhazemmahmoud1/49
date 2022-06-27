const express = require('express')
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient();

let getWallet = async (req, res) => {

    if (req.user != null) {
        return res.json({
            wallet: await db.wallet.findFirst({
                where: {
                    user_id: req.user.id
                }
            }),
            totalCashBack: (await db.dailyCashBack.aggregate({
                where: {
                    user_id: req.user.id
                },
                _sum: {
                    amount: true
                }
            }))
        })
    } else {
        return res.status(403).send('User is not provided in the database, or not found , or not logged in.')
    }
}

module.exports = {getWallet,}