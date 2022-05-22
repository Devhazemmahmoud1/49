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

    if (attachment) {
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
    }

    // create working days for this resturant   
    if (workingDays) {
        for (item of workingDays) {
            await db.restWorkingDays.create({
                data: {
                    day_ar: item.day_ar,
                    day_en: item.day_en,
                    resturant_id: createRest.id
                }
            })
        }
    }

    return res.status(200).json({
        success: {
            success_ar: 'تم اضافه مطعمك بنجاح.',
            success_en: 'Your resturant has been added successfully.',
            id: createRest.id
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

    if (!name || !price ) {
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
            name: name,
            description: description ?? undefined,
            price: price,
            url: attachment.filename ?? undefined,
            subCategory: {
                connect: { id: categoryId }
            }
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

/* update a specific resturant */
let updateResturant = async (req,res) => {
    const { name, lng, lat, workingDays, workingFrom, workingTo, contantNumber, resturantId, attachment } = req.body

    if (! resturantId) {
        return res.status(403).json({
            error: {
                error_en: 'Resturant not found',
                error_ar: 'المطعم غير موجود.'
            }
        })
    }

    try {
        await db.resturants.update({
            where: {
                id: parseInt(resturantId)
            }, 
            data: {
                name: name ?? undefined,
                lng: lng ?? undefined,
                lat: lat ?? undefined,
                workFrom_ar: workingFrom ?? undefined,
                workFrom_en: workingFrom ?? undefined,
                workTo_ar: workingTo ?? undefined,
                workTo_en: workingTo ?? undefined,
                contant_number: contantNumber ?? undefined,
            }
        })

        if (workingDays) {

            await db.restWorkingDays.deleteMany({
                where: {
                    resturant_id: parseInt(resturantId)
                }
            })

            for (item of workingDays) {
                await db.restWorkingDays.create({
                    data: {
                        day_ar: item.day_ar,
                        day_en: item.day_en,
                        resturant_id: parseInt(resturantId)
                    }
                })
            }            
        }

        return res.status(200).json({
            success: {
                success_ar: 'تم تعديل البيانات المطلوبه.',
                success_en: 'Your information has been updated.'
            }
        })

    } catch (e) {
        console.log(e)
        return false;
    }

}

let deleteResturant = async (req,res) => {
    const { id } = req.body

    if (!id) return res.status(403).json({
        error: {
            error_ar: 'المطعم غير موجود.',
            error_en: 'Resturant not found.'
        }
    })

    let checkId = await db.resturants.findFirst({
        where: {
            id: parseInt(id)
        }
    })

    if (! checkId) return res.status(403).json({
        error: {
            error_ar: 'المطعم غير موجود.',
            error_en: 'Resturant not found.'
        }
    })

    // deleting proccess 

    await db.resturants.delete({
        where: {
            id: parseInt(id)
        }
    })

    return res.status(200).json({
        success: {
            success_en: 'Resturant has been deleted successfully.',
            success_ar: 'تم مسح المطعم الخاص بك.'
        }
    })
}

let updateMainCategories = async (req, res) => {
    const { id, name } = req.body

    if (!id) return res.status(403).json({
        error: {
            error_ar: 'القسم غير موجود.',
            error_en: 'Category is not found.'
        }
    })

    let checkCategory = await db.resturantMainCategoryMenu.findFirst({
        where: {
            id: parseInt(id)
        }
    })

    if (! checkCategory) return res.status(403).json({
        error: {
            error_ar: 'القسم غير موجود.',
            error_en: 'Category is not found.'
        }
    })

    // updating proccess

    await db.resturantMainCategoryMenu.update({
        where: {
            id: parseInt(id)
        },
        data: {
           name: name ?? undefined 
        }
    })

    return res.status(200).json({
        success: {
            success_ar: 'تم تعديل القسم بنجاح.',
            success_en: 'Category has been updated successfully.'
        }
    })
}

let deleteMainCategories = async (req, res) => {
    const { id } = req.body

    if (! id) return res.status(403).json({
        error: {
            error_ar: 'القسم غير موجود.',
            error_en: 'Category is not found.'
        }
    })

    let checkCategory = await db.resturantMainCategoryMenu.findFirst({
        where: {
            id: parseInt(id)
        }
    })

    if (! checkCategory) return res.status(403).json({
        error: {
            error_ar: 'القسم غير موجود.',
            error_en: 'Category is not found.'
        }
    })

    // delete proccess 

    await db.resturantMainCategoryMenu.delete({
        where: {
            id: parseInt(id)
        }
    })

    return res.status(200).json({
        success: {
            success_ar: 'تم مسح القسم بنجاح.',
            success_en: 'Category has been deleted successfully.'
        }
    })    

}

let updateMealForResturant = async (req, res) => {
    const { id,  name, description, price } = req.body

    if (! id) return res.status(403).json({
        error: {
            error_ar: 'القسم غير موجود.',
            error_en: 'Category is not found.'
        }
    })

    let checkCategory = await db.resturantSpecificCategoryMeal.findFirst({
        where: {
            id: parseInt(id)
        }
    })

    if (! checkCategory) return res.status(403).json({
        error: {
            error_ar: 'القسم غير موجود.',
            error_en: 'Category is not found.'
        }
    })
    
    await db.resturantSpecificCategoryMeal.update({
        where: {
            id: parseInt(id),
        },
        data: {
            name: name ?? undefined,
            description: description ?? undefined,
            price: price.toString()
        }
    })

    return res.status(200).json({
        success: {
            success_ar: 'تم تعديل الوجبه بنجاح.',
            success_en: 'Meal has been updated successfully.'
        }
    })  

}

let deleteMealForResturant = async (req, res) => {
    const { id } = req.body
    if (! id) return res.status(403).json({
        error: {
            error_ar: 'القسم غير موجود.',
            error_en: 'Category is not found.'
        }
    })

    let checkCategory = await db.resturantSpecificCategoryMeal.findFirst({
        where: {
            id: parseInt(id)
        }
    })

    if (! checkCategory) return res.status(403).json({
        error: {
            error_ar: 'القسم غير موجود.',
            error_en: 'Category is not found.'
        }
    })
    
    await db.resturantSpecificCategoryMeal.delete({
        where: {
            id: parseInt(id),
        },
    })

    return res.status(200).json({
        success: {
            success_ar: 'تم مسح الوجبه بنجاح.',
            success_en: 'Meal has been deleted successfully.'
        }
    })  

}

let getResturants = async (req, res) => {
    let list = await db.resturants.findMany({
        where: {
            user_id: req.user.id
        },
        include: {
            resturantAttachments: true,
            workingDays: true,
            resturantCategory: true,
        }
    })
    return res.status(200).json(list)
}

let getResturant = async (req, res) => {

    const { id } = req.params

    let rest = await db.resturants.findFirst({
        where: {
            id: parseInt(id)
        },
        include: {
            resturantAttachments: true,
            workingDays: true,
            resturantCategory: {
                include: {
                    resutantMenu: true,
                }
            },
        }
    })
    return res.status(200).json(rest)
}

let getResturantCategories = async (req, res) => {
    const { id } = req.params

    if (!id ) return

    let getCategories = await db.resturantMainCategoryMenu.findMany({
        where: {
            resturant_id: parseInt(id)
        }
    })

    return res.status(200).json(getCategories)
}

let getReturantMeals = async (req, res) => {
    const { id } = req.params

    if (! id) return res;

    let meals = await db.resturantSpecificCategoryMeal.findMany({
        where: {
            mainCategoryId: parseInt(id)
        }
    })

    return res.status(200).json(meals)
}

module.exports = { createResturant, createMainCategories, createMealForResturant, updateResturant, deleteResturant, updateMainCategories, deleteMainCategories, updateMealForResturant, deleteMealForResturant, getResturants, getResturant, getResturantCategories, getReturantMeals }