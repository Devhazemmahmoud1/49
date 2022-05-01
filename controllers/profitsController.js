const express = require('express')
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient();
const moment = require('moment')

/* Calculating profit after 5 years and 10 years  */
let showMyInvestment = async () => {

}

module.exports = { showMyInvestment }