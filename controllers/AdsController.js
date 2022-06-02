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
            subCategory_id: parseInt(id)
        }
    })

    return res.status(200).json(props)
}

/* Fetching a single ad from our end */
let getAd = async (req, res) => {
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
            values: {
                include: {
                    Subprops: true,
                }
            },
            sub: {
                select: {
                    id: true,
                }
            }
        }
    })

    return res.status(200).json(adDetails)
}

/* Creating a new ad method */
let createNewAd = async (req, res) => {
    const { mainCategory, subCategory, adProps } = req.body
    if (!subCategory || !mainCategory) {
        return res.status(403).json({
            error: {
                error_ar: 'Ad category id for sub and main are required.',
                error_en: 'Ad category id for sub and main are required.'
            }
        })
    }

    // fetch all the props 



    // Create a new Ad
    let creatingAd = await db.advertisment.create({
        data: {
            title: '',
            desc: '',
            user_id: req.user.id,
            mainCategory_id: parseInt(mainCategory),
            subCategory_id: parseInt(subCategory)
        }
    })

    // creating props for this ad
    for (item of adProps) {

        if (item.identifier == 7700 || item.identifier == 700 || item.identifier == 33
            || item.identifier == 44 || item.identifier == 55) {
            // attachment images     
            await db.userPropValues.create({
                data: {
                    subCategoryProperty_id: item.subCategoryProperty_id,
                    subCategory_id: item.subCategory_id,
                    ad_id: creatingAd.id,
                    value: JSON.stringify(item.value)
                }
            })

            continue;
        }

        if (item.identifier == 900) {
            // Video attachment
            await db.userPropValues.create({
                data: {
                    subCategoryProperty_id: item.subCategoryProperty_id,
                    subCategory_id: item.subCategory_id,
                    ad_id: creatingAd.id,
                    value: JSON.stringify(item.value)
                }
            })

            continue;
        }

        if (item.identifier == 20000) {
            // PDF attachment
            await db.userPropValues.create({
                data: {
                    subCategoryProperty_id: item.subCategoryProperty_id,
                    subCategory_id: item.subCategory_id,
                    ad_id: creatingAd.id,
                    value: JSON.stringify(item.value)
                }
            })

            continue;
        }

        if (item.identifier == 10000) {
            // Page Title
            await db.userPropValues.create({
                data: {
                    subCategoryProperty_id: item.subCategoryProperty_id,
                    subCategory_id: item.subCategory_id,
                    ad_id: creatingAd.id,
                    value: JSON.stringify(item.value)
                }
            })

            continue;
        }

        await db.userPropValues.create({
            data: {
                subCategoryProperty_id: item.subCategoryProperty_id,
                subCategory_id: item.subCategory_id,
                ad_id: creatingAd.id,
                value: item.value.toString()
            }
        })

        continue;
    }

    return res.status(200).json({
        success: {
            success_en: 'Your advertisment has been submitted and waiting for review.',
            success_ar: 'تم اضافه اعلانك و في انتظار المراجعه.'
        }
    })

}

/*  Edit an ad  */
let EditAd = async (req, res) => {

}


/* Add a specific ad to favo list according to the giving ad_id  */
let addFavo = async (req, res) => {
    const { ad_id } = req.body

    if (!ad_id) {
        return res.status(403).send("INVALID AD ID")
    }

    let checkAd = await db.advertisment.findFirst({ where: { id: parseInt(ad_id) } });

    if (!checkAd) return;

    // check if this user has already added this item to list 

    let checkFavoList = await db.favorates.findFirst({
        where: {
            ad_id: parseInt(ad_id),
            user_id: req.user.id
        }
    })

    if (checkFavoList) {
        return res.status(403).json({
            error: {
                error_en: 'This ad is already in your favrite list.',
                error_ar: 'هذا الاعلان مسجل بالفعل في المفضله.'
            }
        })
    }

    // add ad_id to favorate
    let op = await db.favorates.create({
        data: {
            ad_id: parseInt(ad_id),
            user_id: req.user.id
        }
    })

    if (op) {
        return res.status(200).json({
            success: {
                success_en: 'Ad has been added to favorite',
                success_ar: 'تم اضافه الاعلان في المفضله'
            }
        })
    }
}

/* Remove a specific ad from favo list */
let removeFavo = async (req, res) => {
    const { ad_id } = req.body

    if (!ad_id) {
        return res.status(403).send("INVALID AD ID")
    }

    let checkAd = await db.advertisment.findFirst({ where: { id: parseInt(ad_id) } });

    if (!checkAd) return;

    // check if this user has already added this item to list 
    let checkFavoList = await db.favorates.findFirst({
        where: {
            ad_id: parseInt(ad_id),
            user_id: req.user.id
        }
    })

    if (!checkFavoList) {
        return res.status(403).json({
            error: {
                error_en: 'This ad is already in your favrite list.',
                error_ar: 'هذا الاعلان مسجل بالفعل في المفضله.'
            }
        })
    }

    // add ad_id to favorate
    let op = await db.favorates.findFirst({
        where: {
            ad_id: parseInt(ad_id),
            user_id: req.user.id
        }
    })

    await db.favorates.delete({
        where: {
            id: op.id
        }
    })

    if (op) {
        return res.status(200).json({
            success: {
                success_en: 'Ad has been deleted from favorite',
                success_ar: 'تم حذف الاعلان من المفضله'
            }
        })
    }

}

let getMyfavorates = async (req, res) => {
    let { page } = req.query

    if (!page) page = 1;

    let maxItems = 15;

    let items = await db.favorates.findMany({
        where: {
            user_id: req.user.id,
        },
        include: {
            ads: {
                include: {
                    attachments: true,
                    values: {
                        include: {
                            Subprops: true,
                        }
                    },
                }
            }
        },
        skip: page == 1 ? 0 : (page * maxItems) - maxItems,
        take: maxItems,
    })

    return res.status(200).json(items)

}

module.exports = { getProperties, getAd, createNewAd, addFavo, removeFavo, EditAd, getMyfavorates }