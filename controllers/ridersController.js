var express = require('express')
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient();
const moment = require('moment')

/* Add a new Rider according to the giving informaiton */
var addRider = async (request, response) => {
    const { carModel, pricePerDistance, attachments, subCategory_id } = request.body

    if (!carModel || !pricePerDistance || pricePerDistance == 0) {
        return response.status(403).json({
            error: {
                error_en: 'Car model and Price per distance are required.',
                error_ar: 'نوع السياره و التسعيره لكل كيلو متر مطلوب.'
            }
        })
    }


    // THIS IS FOR THE FLUTTER DEV

    if (!attachments) {
        return response.status(403).json({
            error: {
                error_ar: 'خطا في الصور',
                error_en: 'Attachments error'
            }
        })
    }


    // FLUTTER NOTIFY ... EACH IMAGE HAS TO HAS A TYPE OF IMAGE VALIDATED FROM OUR FRNTEND
    // Create a new rider 
    let createNewRider = await db.ride.create({
        data: {
            user_id: request.user.id,
            distancePerKilo: parseInt(pricePerDistance),
            carModel: carModel.toString(),
            category_id: parseInt(subCategory_id),
        }
    });

    if (!createNewRider) {
        return response.status(403).json({
            error: {
                error_en: 'Error Occur',
                error_ar: 'Error Occur'
            }
        });
    }

    await db.users.update({
        where: {
            id: request.user.id
        },
        data: {
            accountType: parseInt(subCategory_id)
        }
    })

    // Create attachments for this rider

    for (item of attachments) {
        await db.ridersAttachment.create({
            data: { rideId: createNewRider.id, url: item.filename, type: item.type }
        })
    }

    return response.status(200).json({
        success: {
            success_en: 'Your information has been submitted successfully.',
            success_ar: 'تم اضافه بياناتك بنجاح.'
        }
    })
}

// 

// accept a ride 

let acceptRide = async (request, response) => {
    // Socket Notification required .. 
}

module.exports = { addRider, acceptRide }