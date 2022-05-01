const express = require('express')

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();


/* Fetch all categories from the Database */

let getAllCategories = async (req, res, next) => {
    let categories = await db.mainCategories.findMany({
        include: {
            subCategories: {
                include: {
                    photo: true
                }
            },
            photo: true
        }
    })
    return res.status(200).json(categories)
}

/* Fetch all sub categories according to the giving parent id */
let getSubCats = async (req, res, next) => {

    const { id } = req.params

    let categories = await db.subCategories.findMany({
        where: {
            parent: parseInt(id)
        },
        include: {
            photo: true
        }
    })
    return res.status(200).json(categories)    
}

module.exports = { getAllCategories, getSubCats }