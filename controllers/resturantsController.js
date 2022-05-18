const express = require('express')
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient();

/* Create a new resturant for a user  */
let createResturant = async (req ,res) => {
    const { resturantName, lng, lat, workFrom, workTo, workingDays, contactNumber, attachment, category_id } = req.body

    if (! resturantName || !lng || !lat || !workFrom || !workTo || !workingDays || attachment || !category_id) {
        return res.status(403).json({
            error: {
                error_en: 'Please fill out all fields',
                error_ar: 'قم بادخال جميع البيانات المطلوبه'
            }
        })
    }

    // create a resturant
    let createRest = await db.resturants.create({
        data: {
            name: resturantName,
            lng: lng,
            lat: lat,
            user_id: req.user.id,
            workFrom_ar: workFrom,
            workFrom_en: workFrom,
            workTo_ar: workTo,
            workTo_en: workTo,
            category_id: parseInt(category_id),            
            contant_number: contactNumber ?? undefined
        }
    });

    if (!createRest) throw new error;

    // create attachments for this resturant
    for (item of attachment) {
        let createAttachment = await db.resturantAttachments.create({
            data: {
                url: item.filename,
                type: 1,
                resturant_id: createRest.id,
            }     
        })

        if (! createAttachment) throw new error;
    }

    // create working days for this resturant   
    for (item of workingDays) {
        await db.restWorkingDays.create({
            data: {
                day_ar: item.day_ar,
                day_en: item.day_en,
                resturant_id: createRest.id
            }
        })
    }

    return res.status(200).json({
        success: {
            success_ar: 'تم اضافه مطعمك بنجاح.',
            success_en: 'Your resturant has been added successfully.'
        }
    })

} 

/* Create Main Category for a specific  */
let createMainCategories = async (req ,res) => {
    const { catName, resturantId } = req.body

    if (! catName || !resturantId ) {
        return res.status(403).json({
            error: {
                error_en: 'Category name is required.',
                error_ar: 'اسم القسم مطلوب.'
            }
        })
    }

    // create a new category for this resturant
    let createNewCategory = await db.resturantMainCategoryMenu.create({
        data: {
            name: catName,
            resturant_id: parseInt(resturantId)
        }
    })

    if (! createNewCategory) throw new error;

    return res.status(200).json({
        success: {
            success_en: 'Category has been added to your list.',
            success_ar: 'تم اضافه القسم بنجاح'
        }
    })
}

/* Create a meal for a speicifc resturant accordng to the giving infoormation  */
let createMealForResturant = async (req, res) => {
    const { name , attachment, price, description, categoryId } = req.body

    if (!name || !attachment || !price ) {
        return res.status(403).json({
            error: {
                error_en: 'Please fill out all fields.',
                error_ar: 'من فضلك قم بادخال جميع البيانات المطلوبه.'
            }
        })
    }

    // create a new meal according to the giving information

    let createMeal = await db.resturantSpecificCategoryMeal.create({
        data: {
            mainCategoryId: parseInt(categoryId),
            name: name,
            description: description ?? undefined,
            price: price,
            url: attachment.filename
        }
    });

    if (! createMeal) throw new error;

    return res.status(200).json({
        success: {
            success_ar: 'تم اضافه الصنف بنجاح.',
            success_en: 'Your meal has been added successfully'
        }
    })
}

module.exports = { createResturant, createMainCategories, createMealForResturant }