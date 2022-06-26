const express = require('express')
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient();

let getWallet = async (req, res) => {
    return res.json(await db.wallet.findFirst({
        where: {
            user_id: req.user.id
        }
    }))
}

module.exports = { getWallet }