const express = require('express')
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient();

let getWallet = async (req, res) => {
    
}

module.exports = { getWallet }