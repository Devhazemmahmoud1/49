const express = require('express')

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

/* Make a new loading according to the giving informarion */

let makeNewLoading = async (req, res) => {
    const { carModel, lng, lat , category_id} = req.body

    if (!carModel || !lng || !lat || !category_id) {
        return res.status(403).json({
            error: {
                error_en: 'Please fill out all fields.',
                error_ar: 'من فضلك قم بادخال جميع البيانات المطلوبه.'
            }
        })
    }

    try {
        let addNewoad = await db.loading.create({
            data: {
                user_id: req.user.id,
                carModel: carModel,
                lng: lng.toString(),
                lat: lat.toString(),
                category_id: parseInt(category_id),
            }
        })

        let att = [
            {
                "fieldname": "attachments",
                "originalname": "download.png",
                "encoding": "7bit",
                "mimetype": "image/png",
                "destination": "./uploads/",
                "filename": "1651423465287---download.png",
                "path": "uploads/1651423465287---download.png",
                "size": 2959,
                "type": 1
            }
        ]

        for (item of att) {
            await db.loadingAttachments.create({
                data: {
                    loading_id: addNewoad.id, url: item.filename, type: item.type
                }
            })
        }
    } catch (error) {
        console.log(error)
        return res.status(403).json({
            error: {
                error_en: 'Something went wrong.',
                error_ar: 'خدث خطا ما.'
            }
        })
    }

    return res.status(200).json({
        success: {
            success_en: 'Your information has been submitted successfully.',
            success_ar: 'تم اضافه بياناتك بنجاح'
        }
    })
}


let createNewLoadingRequest = async (request, response) => {
    const { checkPointLng, checkPointLat, deliverPointLng, deliverPointLat, date, description, price, attachment } = req.body

    if (! checkPointLng || !checkPointLat || !deliverPointLng || !deliverPointLat || !date || !price)
    {
        return res.status(403).json({
            error: {
                error_en: 'Please fill out all the fields',
                error_ar: ''
            }
        });
    }

    let insertRequest = await db.loadingRequests.create({
        data: {
            client_id: request.user.id,
            hash: '',
            fromLng: checkPointLng,
            fromLat: checkPointLat,
            toLng: deliverPointLng,
            toLat: deliverPointLat,
            date: date,
            price: price,
            description: description ?? '',      
        }
    });

    if (insertRequest) {
        if (attachment) {
            for (item of attachment) {
                try {
                    await db.loadingAttachments.create({
                        data: {
                            request_id: insertRequest.id,
                            url: item.filename
                        }
                    })
                } catch (error) {
                    console.log(error)
                    return;
                }
            }
        }
    }

    return response.status(200).json({
        success: {
            success_ar: 'تم اضافه طلبك بنجاح.',
            success_en: 'Your request has been submitted.'
        }
    })
}



module.exports = { makeNewLoading, createNewLoadingRequest }