const express = require('express')
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

let newCategoriesWithTotal = []

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

    for (item of categories) {
        let total = await db.advertisment.aggregate({
            where: {
                mainCategory_id: item.id
            }
        })

        newCategoriesWithTotal.push(total)
    }

    return res.status(200).json(newCategoriesWithTotal)
}

/* Fetch all sub categories according to the giving parent id */
let getSubCats = async (req, res, next) => {

    const { id } = req.params

    let newCategoriesWithTotal = []

    let categories = await db.subCategories.findMany({
        where: {
            parent: parseInt(id)
        },
        include: {
            photo: true
        }
    })

    for (item of categories) {
        let total = await db.advertisment.aggregate({
            where: {
                mainCategory_id: item.id
            }
        })

        newCategoriesWithTotal.push(total)
    }
    
    return res.status(200).json(newCategoriesWithTotal)    
}



module.exports = { getAllCategories, getSubCats }