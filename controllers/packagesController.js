var express = require('express')
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

/* Get all the available packages */
async function getPackages(req, res) {
    return res.json({
        ads: await db.adsPackages.findMany({})
    })
}

/* post a new ad for a company */
let postAd = async (req, res) => {
    const { package_id, text, banner } = req.body

    if (!package_id || !banner) {
        return res.send('Error banner or package must be provided')
    }

    try {

        await db.companiesAds.create({
            data: {
                user_id: req.user.id,
                package_id: parseInt(package_id),
                adText: text ?? '',
                isApproved: 0,
                banner: banner[0].filename
            }
        })

        return res.json({
            success: {
                success_en: 'Your ad has been submitted.',
                success_ar: 'تم اضافه طلبك.'
            }
        })

    } catch (e) {
        throw new e
    }
}

/* Get my own ads */
let getMyAds = async (req, res) => {
    return res.json({
        ads: await db.companiesAds.findMany({
            where: {
                user_id: req.user.id,
            }
        })
    })
}

/* Delete a specific ad from my list */
let deleteMyAd = async (req, res) => {
    const { id } = req.body

    if (!id) {
        return res.send('No id provided')
    }

    // check if mine

    let checkAd = await db.companiesAds.findFirst({
        where: {
            id: parseInt(id),
            user_id: req.user.id
        }
    })

    if (!checkAd) {
        return res.send('This ad is not yours')
    }

    try {
        await db.companiesAds.delete({
            where: {
                id: checkAd.id
            }
        })

        return res.json({
            success: {
                success_en: 'Your ad has been deleted.',
                success_ar: 'تم حذف اعلانك بنجاح.'
            }
        })

    } catch (e) {
        throw new e
    }
}

module.exports = {
    getPackages,
    postAd,
    getMyAds,
    deleteMyAd
}