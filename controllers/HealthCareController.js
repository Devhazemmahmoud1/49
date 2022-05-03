const express = require('express')
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient();

let createNewDoctorHost = async (req, res) => {
    const { contactNumber, specification, lng, lat, workFrom, workTo, workingDays, attachments, price, waitingPeriod, category_id } = req.body

    if (!specification || !lng || !lat || !workFrom || !workTo || !price || !workingDays || !category_id) {
        return res.status(403).json({
            error: {
                error_en: 'Please fill out all fields.',
                error_ar: 'من فضلك قم بادخال حميع البيانات.'
            }
        })
    }

    // create a new HealthCare Host
    let Host = await db.healthCare.create({
        data: {
            contact_number: contactNumber ?? undefined,
            specification: specification,
            lng: lng,
            lat: lat,
            workFrom: workFrom,
            workTo: workTo,
            price: price,
            category_id: parseInt(category_id),
            waitingPeriod: waitingPeriod ?? undefined
        }
    })

    if (! Host) throw new error;

    // create attachment for this host
    if (attachments) {
        for (item of attachments) {
            await db.healthCareAttachments.create({
                data: {
                    health_id: Host.id,
                    url: item.filename,
                    type: item.type
                }
            })
        }
    }

    // add working days to this host
    if (workingDays) {
        for (days of workingDays) {
            await db.docWorkingDays.create({
                data: {
                    doc_id: Host.id,
                    day_en: days.day_en,
                    day_ar: days.day_ar
                }
            })
        }
    }

    return res.status(200).json({
        success: {
            success_en: 'Your information has been added successfully',
            success_ar: 'تم اضافه البيانات بنجاح.'
        }
    })
}

module.exports = { createNewDoctorHost }