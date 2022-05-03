const express = require('express')
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

/* Get specific properties for a sub category  */
let getProperties = async (req, res) => {
    const { id } = req.params

    if (!id) {
        return res.status(403).send('Error 403 ID is not valid')
    }

    let props = await db.subCategoryProperties.findMany({
        where: {
            category_id: parseInt(id)
        }
    })

    return res.status(200).json(props)
}

/* Fetching a single ad from our end */
let getAd = async (req,res) => {
    const { id } = req.params

    if (!id) {
        return res.status(403).send('ID Not FOUND')
    }

    // get details

    let adDetails = await db.advertisment.findFirst({
        where: {
            id: parseInt(id)
        },
        include: {
            attachments: true,
            values: {
                include: {
                    Subprops: true,
                }
            },
            sub:{
               select: {
                   id: true,
               } 
            }
        }
    })

    return res.status(200).json(adDetails)
}

module.exports = { getProperties, getAd }