const express = require('express')

const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

/* Make a new loading according to the giving informarion */
let makeNewLoading = async (req, res) => {
    const { carModel, carType,  lng, lat , subCategory_id, attachments} = req.body

    if (!carModel || !carType || !lng || !lat || !subCategory_id) {
        return res.status(403).json({
            error: {
                error_en: 'Please fill out all fields.',
                error_ar: 'من فضلك قم بادخال جميع البيانات المطلوبه.'
            }
        })
    }

    try {

        // check if they have registered before in another category
        let checkRide = await db.ride.findFirst({
            where: {
                user_id: req.user.id
            }
        })

        if (checkRide) {
            return res.status(403).json({
                error: {
                    error_en: 'You cannot register in this section',
                    error_ar: 'You cannot register in this section'
                }
            })
        }


        let checkLoading = await db.loading.findFirst({
            where: {
                user_id: req.user.id
            }
        })
    
        if (checkLoading) {
            return res.status(403).json({
                error: {
                    error_en: 'You cannot register in this section.',
                    error_ar: 'You cannot register in this section.'
                }
            })        
        }

        // same as food 


        // same as health



        let addNewoad = await db.loading.create({
            data: {
                user_id: req.user.id,
                carModel: carModel.toString(),
                carType: carType.toString(),
                lng: lng.toString(),
                lat: lat.toString(),
                category_id: parseInt(subCategory_id),
                hashCode: ''
            }
        })

        await db.users.update({
            where: {
                id: req.user.id
            },
            data: {
                accountType: parseInt(subCategory_id)
            }
        })

        for (item of attachments) {
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

/* Create a new loading request */
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

/* Show my own DashBoard */
let myDashboard = async (req, res) => {

    // check if im register and approved 

    let check = await db.loading.findFirst({
        where: {
            user_id: req.user.id,
            isApproved: 1,
        }
    })

    if (!check ) {
        return res.status(403).json({
            error: {
                error_en: 'You are not approved as an agent yet.',
                error_ar: 'You are not approved as an agent yet.'
            }
        })
    }

    let myTrips = await db.loadingRequests.findMany({
        where: {
            isDone: 1,
            agent_id: req.user.id
        },
        include: {
            photos: true,
        }
    })

    for (item of myTrips) {
        item.clientInfo = await db.users.findFirst({
            where: {
                id: item.client_id
            }
        })
    }

    return res.json({
        myTrips: myTrips,
        totalTrips: await db.loadingRequests.aggregate({
            where: {
                agent_id: req.user.id
            },
            _count: {
                id: true
            }
        }),
        registerForm: await db.loading.findFirst({
            where: {
                user_id: req.user.id,
                isDone: 1,
            },
            include: {
                loadingAttachment: true,
            }
        }),
        profit: await db.loadingRequests.aggregate({
            where: {
                agent_id: req.user.id,
                isDone: 1
            },
            _sum: {
                total: true
            }
        }),
    })
}

let deleteLoadingAgent = async (req, res) => {
    const { password } = req.body

    if (!password) {
        return res.send('No password provided')
    }

    if (req.user) {
        let getUser = await db.users.findFirst({
            where: {
                id: req.user.id
            }
        })

        const validPassword = hash.compareSync(password, getUser.password);

        if (validPassword) {

            try {
                let user = await db.loading.findFirst({
                    where: {
                        user_id: req.user.id
                    }
                })

                if (!user) {
                    return res.status(403).send('User is not an agent')
                }

                await db.$queryRaw`SET FOREIGN_KEY_CHECKS=0;`
                await db.$queryRaw`DELETE FROM loadingAttachments WHERE loading_id = ${user.id}`
                await db.$queryRaw`DELETE FROM loading WHERE id = ${user.id}`
                await db.$queryRaw`SET FOREIGN_KEY_CHECKS=1;`

                return res.send('You account has been deleted')

            } catch (e) {
                console.log(e)
                return;
            }
        } else {
            res.status(403).json({
                error: {
                    error_en: 'Password is incorrect',
                    error_ar: 'كلمه المرور غير صحيحه.'
                }
            })
        }

    } else {
        return res.send('Something went wrong')
    }
}

module.exports = { makeNewLoading, createNewLoadingRequest, myDashboard, deleteLoadingAgent }