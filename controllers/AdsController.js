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
            attachments: true,
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
    const { title, desc, mainCategory, subCategory, attachments, adProps } = req.body
    if (!title || !subCategory || !mainCategory) {
        return res.status(403).json({
            error: {
                error_ar: 'عنوان الاعلان مطلوب.',
                error_en: 'Ad title is required.'
            }
        })
    }

    // Create a new Ad
    let creatingAd = await db.advertisment.create({
        data: {
            title: title,
            desc: desc,
            user_id: req.user.id,
            mainCategory_id: parseInt(mainCategory),
            subCategory_id: parseInt(subCategory)
        }
    })

    // let attachment = [
    //     {
    //         filename: 'Static data'
    //     },
    //     {
    //         filename: 'Dynamic data'
    //     }
    // ];

    // creating attachments for this ad
    for (item of attachments) {
        let createAttachments = await db.adsAttachments.create({
            data: {
                ad_id: creatingAd.id,
                url: item.filename,
            }
        })
    }

    /*let props = [
        { subCategory_id: 1, ad_id: creatingAd.id, subCategoryProperty_id: 1, value: 200 },
    ]*/

    // creating props for this ad
    for (item of props) {
        await db.userPropValues.create({
            data: {
                subCategoryProperty_id: item.subCategoryProperty_id,
                subCategory_id: item.subCategory_id,
                ad_id: creatingAd.id,
                value: item.value.toString()
            }
        })
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

    if (! checkFavoList) {
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

    if (! page) page = 1;

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