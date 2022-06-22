const express = require('express')
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

/* Fetch all categories from the Database */
let getAllCategories = async (req, res, next) => {
    let categories = await db.mainCategories.findMany({
        include: {
            photo: true
        },
        orderBy: {
            created_at: 'asc'
        }
    })

    for (item of categories) {
        let total = await db.advertisment.aggregate({
            _count: {
                id: true
            },
            where: {
                mainCategory_id: item.id
            }
        })

        item.total = total

        if (req.user) {
            item.isFavo = await db.MainCategoriesFavo.findFirst({
                where: {
                    user_id: req.user.id,
                    category_id: item.id
                }
            }) != null
        } else {
            item.isFavo = false
        }
    }

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

    for (item of categories) {
        let total = await db.advertisment.aggregate({
            _count: {
                id: true
            },
            where: {
                subCategory_id: item.id
            }
        })
        item.total = total

        if (req.user) {
            item.isFavo = await db.SubCategoriesFavo.findFirst({
                where: {
                    user_id: req.user.id,
                    category_id: item.id
                }
            }) != null
        } else {
            item.isFavo = false
        }
    }
    
    return res.status(200).json(categories)    
}

/* Get a specific Sub category by id */
let getSpecCat = async (req ,res) => {
    const { id } = req.params
    return res.json(await db.subCategories.findFirst({where: {id: parseInt(id)}, include: {photo: true}}))
}

module.exports = { getAllCategories, getSubCats, getSpecCat }