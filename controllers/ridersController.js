var express = require('express')
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient();
const moment = require('moment');
const { pleasePayNotification } = require('../controllers/notificationsController/notifications')
const hash = require('bcrypt')

/* Add a new Rider according to the giving informaiton */
var addRider = async (request, response) => {
    const { carModel, carType, metalLetters, metalNumbers, pricePerDistance, attachments, subCategory_id } = request.body

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
            carType: carType.toString(),
            metalPaletLetters: metalLetters.toString(),
            metalPaletNumbers: metalNumbers.toString(),
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


/* Find drivers around 5 KMs */
let findRiders = async (req, res) => {
    const { userType, From, To, distance, price, lat, lng, destinationLng, destinationLat, tripTime, isFast, } = req.query;

    var drivers = [];

    if (Object.keys(sockets).length !== 0) {
        for (socket in sockets) {
            //check if a user is permuim 
            if (sockets[socket].user_id == req.user.id &&
                sockets[socket].subscription != null &&
                sockets[socket].subscription.isPersonalAccount == 1 &&
                sockets[socket].subscription.permium == 1 &&
                moment(sockets[socket].subscription.startDate).add(sockets[socket].subscription.period, 'days').format('YYYY/MM/DD HH:mm:ss') >= moment().format('YYYY/MM/DD HH:mm:ss')
            ) {

                console.log('i am a perium user')
                for (rider in sockets) {
                    if (sockets[rider].userType == userType
                        && sockets[rider].isReady == true
                        && sockets[rider].currentLocation.lat != ''
                        && sockets[rider].currentLocation.lng != ''
                        && sockets[rider].isApproved != 0
                        && sockets[rider].status != 2) {
                        console.log(21212)
                        console.log('a preium user is looking for riders')

                        if (drivers.includes(sockets[rider].user_id)) continue;

                        if (userType == 897 || userType == 891 || userType == 898) {
                            let calculateDistance = calcCrow(lat, lng, sockets[rider].currentLocation.lat, sockets[rider].currentLocation.lng).toFixed(1)
                            console.log(222)
                            console.log("Perium distance1 =" + calculateDistance)
                            if (calculateDistance > 5) continue;
                        }

                        if (sockets[rider].subscription == null) {

                            let checkIfHadFreeRideBefore = await db.freeRide.findFirst({
                                where: {
                                    rider_id: parseInt(sockets[rider].user_id)
                                },
                                orderBy: {
                                    created_at: 'desc'
                                }
                            })

                            if (checkIfHadFreeRideBefore) {
                                if (moment(checkIfHadFreeRideBefore.created_at).add('1', 'days').format('YYYY/MM/DD HH:mm:ss') >= moment().format('YYYY/MM/DD HH:mm:ss')) {

                                    // drivers.push(sockets[rider].user_id)
                                    // continue
                                    sockets[rider].freeRide = true
                                }
                            }
                        }

                        if (sockets[rider].user_id == req.user.id) continue;

                        if (sockets[rider].lastTrip.lat != null && sockets[rider].lastTrip.lng != null && destinationLng && destinationLat) {
                            console.log('final destination')
                            let calculateDistance = calcCrow(sockets[rider].lastTrip.lat, sockets[rider].lastTrip.lng, destinationLat, destinationLng).toFixed(1)
                            console.log("distance =" + calculateDistance)
                            if (calculateDistance > 5) {
                                drivers.push(sockets[rider].user_id)
                                continue;
                            }
                        }

                        global.io.to(sockets[rider].socket_id).emit('request', JSON.stringify({
                            rider_id: sockets[rider].user_id,
                            user_id: req.user.id,
                            price: price ?? 0,
                            user_name: req.user.firstName,
                            distance: distance,
                            userType: userType,
                            streetFrom: From,
                            streetTo: To,
                            customerLng: lng,
                            customerLat: lat,
                            destinationLat: destinationLat,
                            destinationLng: destinationLng,
                            tripTime: tripTime,
                            freeRide: sockets[rider].freeRide
                        }));

                        drivers.push(sockets[rider].user_id)

                        if (sockets[rider].subscription == null) {
                            let notify = {
                                message_ar: 'Congratulations, You have a free ride from 49, Stay tuned.',
                                message_en: 'تهانينا لقد حصلت علي رحله مجانيه من تطبيق ٤٩.',
                                user: sockets[rider].user_id,
                                userFirstName: 0,
                                rideId: 0,
                                type: 510,
                            }

                            pleasePayNotification(notify)

                        } else {
                            let notify = {
                                message_ar: `New ride request from ${req.user.firstName}.`,
                                message_en: `${req.user.firstName} ليك طلب توصيله جديد.`,
                                user: sockets[rider].user_id,
                                userFirstName: 0,
                                rideId: 0,
                                type: 510,
                            }

                            pleasePayNotification(notify)
                        }
                        continue;
                    }
                }

            } else {
                console.log('i am a noraml user')

                for (rider1 in sockets) {
                    if (sockets[rider1].userType == userType
                        && sockets[rider1].isReady == true
                        && sockets[rider1].currentLocation.lat != ''
                        && sockets[rider1].currentLocation.lng != ''
                        && sockets[rider1].isApproved != 0
                        && sockets[rider1].status != 2) {
                        console.log(21212)
                        console.log(sockets[rider1].user_id)
                        console.log('passed here')

                        if (drivers.includes(sockets[rider1].user_id)) continue;

                        if (sockets[rider1].subscription != null) {

                            console.log('a normal user is looking for riders')
                            if (userType == 897 || userType == 891 || userType == 898) {
                                let calculateDistance = calcCrow(lat, lng, sockets[rider1].currentLocation.lat, sockets[rider1].currentLocation.lng).toFixed(1)
                                console.log(222)
                                console.log("Perium distance1 =" + calculateDistance)
                                if (calculateDistance > 5) continue;
                            }

                            if (sockets[rider1].user_id == req.user.id) continue;

                            global.io.to(sockets[rider1].socket_id).emit('request', JSON.stringify({
                                rider_id: sockets[rider1].user_id,
                                user_id: req.user.id,
                                price: price ?? 0,
                                distance: distance,
                                userType: userType,
                                streetFrom: From,
                                streetTo: To,
                                customerLng: lng,
                                customerLat: lat,
                                destinationLat: destinationLat,
                                destinationLng: destinationLng,
                                tripTime: tripTime,
                                freeRide: sockets[rider1].freeRide
                            }));

                            drivers.push(sockets[rider1].user_id)

                            let notify = {
                                message_ar: `New ride request from ${req.user.firstName}.`,
                                message_en: `${req.user.firstName} ليك طلب توصيله جديد من.`,
                                user: sockets[rider1].user_id,
                                userFirstName: 0,
                                rideId: 0,
                                type: 510,
                            }

                            pleasePayNotification(notify)
                            continue;
                        } else {
                            console.log('passed there')
                            console.log('a normal user for non sub is looking for riders')
                            if (userType == 897 || userType == 891 || userType == 898) {
                                let calculateDistance = calcCrow(lat, lng, sockets[rider1].currentLocation.lat, sockets[rider1].currentLocation.lng).toFixed(1)
                                console.log(222)
                                console.log("Perium distance1 =" + calculateDistance)
                                if (calculateDistance > 5) continue;
                            }

                            if (drivers.includes(sockets[rider1].user_id)) continue;

                            let checkIfHadFreeRideBefore = await db.freeRides.findFirst({
                                where: {
                                    rider_id: parseInt(sockets[rider1].user_id)
                                },
                                orderBy: {
                                    created_at: 'desc'
                                }
                            })

                            if (checkIfHadFreeRideBefore) {
                                if (moment(checkIfHadFreeRideBefore.created_at).add('1', 'days').format('YYYY/MM/DD HH:mm:ss') >= moment().format('YYYY/MM/DD HH:mm:ss')) {
                                    // drivers.push(sockets[rider1].user_id)
                                    // continue
                                    sockets[rider1].freeRide = true
                                }
                            }

                            if (sockets[rider1].user_id == req.user.id) continue;

                            if (sockets[rider1].lastTrip.lat != null && sockets[rider1].lastTrip.lng != null && destinationLng && destinationLat) {
                                console.log('final destination')
                                let calculateDistance = calcCrow(sockets[rider1].lastTrip.lat, sockets[rider1].lastTrip.lng, destinationLat, destinationLng).toFixed(1)
                                console.log("distance =" + calculateDistance)
                                if (calculateDistance > 5) {
                                    drivers.push(sockets[rider1].user_id)
                                    continue;
                                }
                            }

                            global.io.to(sockets[rider1].socket_id).emit('request', JSON.stringify({
                                rider_id: sockets[rider1].user_id,
                                user_id: req.user.id,
                                price: (parseInt(price) + 20) ?? 0,
                                distance: distance,
                                userType: userType,
                                streetFrom: From,
                                streetTo: To,
                                customerLng: lng,
                                customerLat: lat,
                                destinationLat: destinationLat,
                                destinationLng: destinationLng,
                                tripTime: tripTime,
                                freeRide: sockets[rider1].freeRide
                            }));

                            let notify = {
                                message_ar: 'Congratulations, You have a free ride from 49, 20 L.E will be paid extra from the client to us.',
                                message_en: 'تهانينا لقد حصلت علي رحله مجانيه من تطبيق ٤٩ ، ٢٠ جنيهات سوف يتم تحصيلها من العميل ك رسوم اضافيه.',
                                user: sockets[rider1].user_id,
                                userFirstName: 0,
                                rideId: 0,
                                type: 510,
                            }

                            drivers.push(sockets[rider1].user_id)

                            pleasePayNotification(notify)
                            continue;
                        }

                    }
                }
            }

            // if (sockets[socket].userType == userType
            //     && sockets[socket].isReady == true
            //     && sockets[socket].currentLocation.lat != ''
            //     && sockets[socket].currentLocation.lng != ''
            //     && sockets[socket].isApproved != 0
            //     && sockets[socket].status != 2) {

            //     console.log(lat, lng)
            //     console.log(sockets[socket].currentLocation.lat, sockets[socket].currentLocation.lng)
            //     console.log("23232" + sockets[socket])
            //     console.log(sockets[socket].subscription)
            //     // we need to check if this driver has already subscribed   
            //     if (sockets[socket].subscription == null) {
            //         console.log(111)
            //         global.io.to(sockets[socket].socket_id).emit('no-subscription', JSON.stringify(
            //             {
            //                 // message_ar: `لديك طلبات توصيله و لكنك غير مشترك اليوم من فضلك اشترك حتي تواصل العمل معنا`,
            //                 // message_en: 'You have ride requests but you did not subscribe today , Please subscribe to keep taking trips.',
            //                 user_id: req.user.id,
            //                 price: price ?? 50,
            //                 message_ar: `قام ${req.user.firstName} بطلب رحله من ... الي ... بسعر 50 جنيه`,
            //                 message_en: req.user.firstName + ' Has requested a ride from' + From + ' to' + To + ' ' + 'for 50 L.E',
            //                 distance: distance ? distance + ' KiloMeters' : 'Unknown',
            //                 userType: userType,
            //                 destinationFrom: From,
            //                 destinationTo: To,
            //                 customerLng: lng,
            //                 customerLat: lat,
            //                 destinationLat: destinationLat,
            //                 destinationLng: destinationLng,
            //                 tripTime: tripTime
            //             }
            //         ));
            //         continue;
            //     }

            //     if (moment(sockets[socket].subscription.startDate).add(sockets[socket].subscription.period, 'days').format('YYYY/MM/DD HH:mm:ss') >= moment().format('YYYY/MM/DD HH:mm:ss')) {
            //         console.log('passed' + sockets[socket].subscription)
            //         console.log(sockets[socket].subscription)
            //         global.io.to(sockets[socket].socket_id).emit('no-subscription', JSON.stringify(
            //             {
            //                 // message_ar: `لديك طلبات توصيله و لكنك غير مشترك اليوم من فضلك اشترك حتي تواصل العمل معنا`,
            //                 // message_en: 'You have ride requests but you did not subscribe today , Please subscribe to keep taking trips.',
            //                 user_id: req.user.id,
            //                 price: price ?? 50,
            //                 message_ar: `قام ${req.user.firstName} بطلب رحله من ... الي ... بسعر ${price ?? 0} جنيه`,
            //                 message_en: req.user.firstName + `Has requested a ride from ${From} to ${To}   for ${price ?? 0}`,
            //                 distance: distance ? distance + ' Km' : 'Unknown',
            //                 userType: userType,
            //                 destinationFrom: From,
            //                 destinationTo: To,
            //                 customerLng: lng,
            //                 customerLat: lat,
            //                 destinationLat: destinationLat,
            //                 destinationLng: destinationLng,
            //                 tripTime: tripTime
            //             }
            //         ));
            //         continue;
            //     }

            //     if (sockets[socket].lastTrip.lat != null && sockets[socket].lastTrip.lng != null && destinationLng && destinationLat) {
            //         console.log('final destination')
            //         let calculateDistance = calcCrow(sockets[socket].lastTrip.lat, sockets[socket].lastTrip.lng, destinationLat, destinationLng).toFixed(1)
            //         console.log("distance =" + calculateDistance)
            //         if (calculateDistance > 5) continue;
            //         global.io.to(sockets[socket].socket_id).emit('request', JSON.stringify(
            //             {
            //                 user_id: req.user.id,
            //                 price: price ?? 50,
            //                 message_ar: `قام ${req.user.firstName} بطلب رحله من ... الي ... بسعر 50 جنيه`,
            //                 message_en: req.user.firstName + ' Has requested a ride from' + From + ' to' + To + ' ' + 'for 50 L.E',
            //                 distance: distance ? distance + ' KiloMeters' : 'Unknown',
            //                 userType: userType,
            //                 destinationFrom: From,
            //                 destinationTo: To,
            //                 customerLng: lng,
            //                 customerLat: lat,
            //                 destinationLat: destinationLat,
            //                 destinationLng: destinationLng,
            //                 tripTime: tripTime
            //             }
            //         ));
            //         continue;
            //     }

            //     let calculateDistance = calcCrow(lat, lng, sockets[socket].currentLocation.lat, sockets[socket].currentLocation.lng).toFixed(1)
            //     console.log(222)
            //     console.log("distance1 =" + calculateDistance)
            //     if (calculateDistance > 5) continue;
            //     global.io.to(sockets[socket].socket_id).emit('request', JSON.stringify(
            //         {
            //             user_id: req.user.id,
            //             price: price ?? 50,
            //             message_ar: `قام ${req.user.firstName} بطلب رحله من ... الي ... بسعر 50 جنيه`,
            //             message_en: req.user.firstName + ' Has requested a ride from ' + From + ' to' + To + ' ' + ' for 50 L.E',
            //             distance: distance ? distance + ' KiloMeters' : 'Unknown',
            //             userType: userType,
            //             destinationFrom: From,
            //             destinationTo: To,
            //             customerLng: lng,
            //             customerLat: lat,
            //             destinationLat: destinationLat,
            //             destinationLng: destinationLng,
            //             tripTime: tripTime
            //         }
            //     ));
            // }
            continue;
        }
        drivers = [];
        res.send('Waiting for our drivers to connect')
    } else {
        return res.send('No socket users was found')
    }
}

let driversToggleStatus = async (req, res) => {
    for (socket in sockets) {
        if (sockets[socket].userType != '0' && sockets[socket].user_id == req.user.id) {
            sockets[socket].isReady = sockets[socket].isReady == true ? false : true
            break;
        }
    }

    return res.send('Status has been toggle')
}

/* Update all users location */
let updateDriversLocation = async (req, res) => {
    const { driver } = req.body
    for (socket in sockets) {
        if (sockets[socket].userType != '0' && sockets[socket].user_id == req.user.id) {
            sockets[socket].currentLocation.lat = driver.lat ?? null
            sockets[socket].currentLocation.lng = driver.lng ?? null
            return res.send(sockets[socket])
            break;
        }
    }
    console.log("Drivers" + sockets)
    return res.send(sockets)
}

/* Calculate total price  */
let getPriceViaDistance = async (req, res) => {
    const { subCategory, distance } = req.params

    if (!subCategory) {
        return res.send('No sub Category was provided')
    }

    let getlowestPricePerKilo = await db.ride.findFirst({
        where: {
            category_id: parseInt(subCategory)
        },
        orderBy: {
            distancePerKilo: 'asc'
        }
    })

    if (getlowestPricePerKilo) {
        var low = parseInt(getlowestPricePerKilo.distancePerKilo) * parseInt(distance) + parseInt(getlowestPricePerKilo.distancePerKilo)
    } else {
        var low = 0
    }


    let getHighestPricePerKilo = await db.ride.findFirst({
        where: {
            category_id: parseInt(subCategory)
        },
        orderBy: {
            distancePerKilo: 'desc'
        }
    })

    if (getHighestPricePerKilo) {
        var high = parseInt(getHighestPricePerKilo.distancePerKilo) * parseInt(distance) + parseInt(getHighestPricePerKilo.distancePerKilo)
    } else {
        var high = 0
    }


    return res.json({
        lowest: low,
        highest: high
    })
}

/* Delete driver profile */
let deleteDriverProfile = async (req, res) => {

    try {

        let ride = await db.ride.findFirst({
            where: {
                user_id: req.user.id
            }
        })

        if (ride) {
            await db.ridersAttachment.deleteMany({
                where: {
                    rideId: ride.id
                }
            })

            await db.ride.delete({
                where: {
                    id: ride.id
                }
            })

            await db.ridesRequested.deleteMany({
                where: {
                    rider_id: req.user.id
                }
            })

            await db.users.update({
                where: {
                    id: req.user.id
                },
                data: {
                    accountType: 0,
                    isApproved: 0,
                }
            })
        }

        return res.json({
            success: {
                success_en: 'Your business account has been deactivated.',
                success_ar: 'تم تعطيل حسابك.'
            }
        })

    } catch (e) {
        throw new e
    }
}

/* Update users price per kilo */
let changePricePerKilo = async (req, res) => {
    const { rate } = req.body

    if (!rate) {
        return res.send('No Rate was provided')
    }

    await db.ride.update({
        where: {
            user_id: req.user.id
        },
        data: {
            distancePerKilo: parseFloat(rate)
        }
    })

    return res.json({
        success: {
            success_en: 'Done',
            success_ar: 'تم'
        }
    })
}

let getDriverForm = async (req, res) => {
    let getRiderInformation = await db.ride.findFirst({
        where: {
            user_id: req.user.id
        },
        include: {
            riderPhoto: true
        }
    })

    let getTotalTrips = await db.ridesRequested.aggregate({
        where: {
            rider_id: req.user.id
        },
        _count: {
            id: true
        }
    })

    return res.json({
        riderInformation: getRiderInformation,
        totalTrips: getTotalTrips,
    })
}

/*  accept a ride and keep it as pending  */
let acceptPendingRide = async (req, res) => {

}

// accept a ride 
let acceptRide = async (req, res) => {
    const {
        user_id,
        rider_id,
        distance,
        tripTime,
        customerLng,
        customerLat,
        destinationLat,
        destinationLng,
        streetFrom,
        streetTo,
        total,
    } = req.body

    if (
        !user_id ||
        !rider_id ||
        !distance ||
        !tripTime ||
        !customerLng ||
        !customerLat ||
        !destinationLat ||
        !destinationLng ||
        !streetFrom ||
        !streetTo ||
        !total
    )

        return res.status(403).send('Something went wrong');

    for (socket in sockets) {
        if (sockets[socket].user_id == rider_id && sockets[socket].status == 1) {

            let ride = await db.ridesRequested.create({
                data: {
                    client_id: parseInt(user_id),
                    rider_id: parseInt(rider_id),
                    distance: distance.toString(),
                    tripTime: tripTime.toString(),
                    customerLng: customerLng.toString(),
                    customerlat: customerLat.toString(),
                    destinationLng: destinationLng.toString(),
                    destinationLat: destinationLat.toString(),
                    streetFrom: streetFrom.toString(),
                    streetTo: streetTo.toString(),
                    total: parseInt(total),
                    isPendding: 1,
                    isDone: 0,
                }
            })

            sockets[socket].status = 2

            global.io.to(sockets[socket].socket_id).emit('accept-ride', JSON.stringify({
                user_id: parseInt(user_id),
                rideId: ride.id,
                rider_id: parseInt(rider_id),
                cleint_name: req.user.firstName,
                distance: distance.toString(),
                tripTime: tripTime.toString(),
                customerLng: customerLng.toString(),
                customerlat: customerLat.toString(),
                destinationLng: destinationLng.toString(),
                destinationLat: destinationLat.toString(),
                streetFrom: streetFrom.toString(),
                streetTo: streetTo.toString(),
                total: parseInt(total),

            }))

            if (sockets[socket].user_id != rider_id) {
                global.io.to(sockets[socket].socket_id).emit('hide-ride', JSON.stringify({
                    user_id: parseInt(user_id),
                }))
            }

            if (sockets[socket].user_id == req.user.id) {
                global.io.to(sockets[socket].socket_id).emit('current-trip', JSON.stringify({
                    user_id: parseInt(user_id),
                    rideId: ride.id,
                    rider_id: parseInt(rider_id),
                    cleint_name: req.user.firstName,
                    distance: distance.toString(),
                    tripTime: tripTime.toString(),
                    customerLng: customerLng.toString(),
                    customerlat: customerLat.toString(),
                    destinationLng: destinationLng.toString(),
                    destinationLat: destinationLat.toString(),
                    streetFrom: streetFrom.toString(),
                    streetTo: streetTo.toString(),
                    total: parseInt(total),
                    driverInfo: await driverInformation(rider_id)
                }))

            }

            return res.send('You already in a trip , finish this to take the other.')
        }
        break;
    }

    try {
        // inserting a new 
        let ride = await db.ridesRequested.create({
            data: {
                client_id: parseInt(user_id),
                rider_id: parseInt(rider_id),
                distance: distance.toString(),
                tripTime: tripTime.toString(),
                customerLng: customerLng.toString(),
                customerlat: customerLat.toString(),
                destinationLng: destinationLng.toString(),
                destinationLat: destinationLat.toString(),
                streetFrom: streetFrom.toString(),
                streetTo: streetTo.toString(),
                total: parseInt(total),
            }
        })

        for (socket in sockets) {
            if (sockets[socket].user_id == rider_id) {
                sockets[socket].status = 1
                global.io.to(sockets[socket].socket_id).emit('accept-ride', JSON.stringify({
                    user_id: parseInt(user_id),
                    rideId: ride.id,
                    rider_id: parseInt(rider_id),
                    cleint_name: req.user.firstName,
                    distance: distance.toString(),
                    tripTime: tripTime.toString(),
                    customerLng: customerLng.toString(),
                    customerlat: customerLat.toString(),
                    destinationLng: destinationLng.toString(),
                    destinationLat: destinationLat.toString(),
                    streetFrom: streetFrom.toString(),
                    streetTo: streetTo.toString(),
                    total: parseInt(total),
                }))
            } else {
                global.io.to(sockets[socket].socket_id).emit('hide-ride', JSON.stringify({
                    user_id: parseInt(user_id)
                }))
            }

            if (sockets[socket].user_id == req.user.id) {
                global.io.to(sockets[socket].socket_id).emit('current-trip', JSON.stringify({
                    user_id: parseInt(user_id),
                    rideId: ride.id,
                    rider_id: parseInt(rider_id),
                    cleint_name: req.user.firstName,
                    distance: distance.toString(),
                    tripTime: tripTime.toString(),
                    customerLng: customerLng.toString(),
                    customerlat: customerLat.toString(),
                    destinationLng: destinationLng.toString(),
                    destinationLat: destinationLat.toString(),
                    streetFrom: streetFrom.toString(),
                    streetTo: streetTo.toString(),
                    total: parseInt(total),
                    driverInfo: await driverInformation(rider_id)
                }))
            }
        }

        return res.send('ok')

    } catch (e) {
        console.log(e)
        return false
    }
}

let startRide = async (req, res) => {
    const { id } = req.body

    if (!id ) return res.status(403).send('ID not provided')

    // check if the ride excets 
    let checkRide = await db.ridesRequested.findFirst({
        where: {
            id: parseInt(id),
        }
    })

    if (! checkRide) {
        return res.status(403).send('Trip is not available right now')
    }

    if (checkRide.ride_status != 0) {
        return res.status(403).send('Ride has already started')
    }

    // set status to taken

    try {
        await db.ridesRequested.update({
            where: {
              id: parseInt(id)  
            },
            data: {
                ride_status: 1,
            }
        })

        for (socket in sockets) {
            if (sockets[socket].user_id == checkRide.client_id) {
                global.io.to(sockets[socket].socket_id).emit('start-ride', JSON.stringify({
                    rider_name: req.user.firstName,
                    rideId: id
                }))
            }
        }

        return res.send('Ride has started')
    } catch (e) {
        console.log(e)
    }
}

// finish  a ride 
let endRide = async (req, res) => {
    const { id } = req.body
    try {
        let getLastTripForDriver = await db.ridesRequested.findFirst({
            where: {
                id: parseInt(id)
            }
        })

        let finish = await db.ridesRequested.update({
            where: {
                id: getLastTripForDriver.id ?? parseInt(id)
            },
            data: {
                isDone: 1,
                isPendding: 0,
                ride_status: 0,
            }
        })

        if (finish) {
            let getClientInfo = await db.users.findFirst({
                where: {
                    id: finish.client_id
                }
            })

            if (getClientInfo) {

                let notify = {
                    message_ar: `Please Pay ${req.user.firstName} ${finsih.total} L.E , It's our pleasure to serve you <3.`,
                    message_en: `Please Pay ${req.user.firstName} ${finsih.total} L.E , It's our pleasure to serve you <3.`,
                    user: getClientInfo.id,
                    userFirstName: getClientInfo.firstName,
                    rideId: finish.id,
                    type: 500,
                }

                pleasePayNotification(notify)

                // socket event to be sent to the other user
                for (socket in sockets) {
                    if (sockets[socket].user_id == getClientInfo.id) {
                        global.io.to(sockets[socket].socket_id).emit('end-of-trip', JSON.stringify({
                            user_id: getClientInfo.id,
                            riderId: finish.rider_id,
                            ride: parseInt(id)
                        }))
                        break;
                    }
                }

                // if there is pending rides for this rider

                let checkIfRiderHasAnotherRequest = await db.ridesRequested.findFirst({
                    where: {
                        rider_id: req.user.id,
                        isPendding: 1
                    },
                    orderBy: {
                        created_at: 'desc'
                    }
                })

                if (checkIfRiderHasAnotherRequest) {
                    for (socket in sockets) {
                        if (sockets[socket].user_id == req.user.id) {
                            sockets[socket].status = 1
                        }

                        await db.ridesRequested.update({
                            where: {
                                id: checkIfRiderHasAnotherRequest.id
                            },
                            data: {
                                isPendding: 0
                            }
                        })

                        break;
                    }
                } else {
                    for (socket in sockets) {
                        if (sockets[socket].user.id == req.user.id) {
                            sockets[socket].status = null
                            break;
                        }
                    }
                }
            } else {
                return res.send('something went wrong')
            }

        }

    } catch (e) {
        throw new e
    }
}

let cancelTrip = async (req , res) => {
    const { id } = req.body

    if (! id) return res.status(403).send('No ID provided')

    // check if this trip exsits 
    let trip = await db.ridesRequested.findFirst({
        where: {
            id: parseInt(id),
            isDone: 0,
        }
    })

    if (! trip) return res.status(403).send('Trip was not found')

    try {

        let cancelThisTrip = await db.ridesRequested.update({
            where: {
                id: parseInt(id)
            },
            data: {
                isDone: 3,
                isPendding: 0,
                ride_status: 0,
            }
        })

        if (cancelThisTrip) {

            if (trip.client_id == req.user.id) {
                // this is the client who cancled the trip
                for (socket in sockets) {
                    if (sockets[socket].user_id == trip.rider_id) {
                        global.io.to(sockets[socket].socket_id).emit('cancel-ride', JSON.stringify({
                            ride_id: trip.id != null ? trip.id : parseInt(id)
                        }))
                        break;
                    }
                }
            } else {
                for (socket in sockets) {
                    if (sockets[socket].user_id == trip.client_id) {
                        global.io.to(sockets[socket].socket_id).emit('cancel-ride', JSON.stringify({
                            ride_id: trip.id != null ? trip.id : parseInt(id)
                        }))
                        break;
                    }
                }
            }
        }

    } catch (e) {
        console.log(e)
    }

    return res.status(200).send('ok')

}

let addFinalDestination = async (req, res) => {
    const { lng, lat } = req.body

    if (!lng || !lat) return res.send('No lat or lng provided');

    for (socket in sockets) {
        if (sockets[socket].user_id == req.user.id) {
            sockets[socket].lastTrip.lng = lng
            sockets[socket].lastTrip.lat = lat
            break;
        }
    }

    return res.send('Final destination was added successfully')
}

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = toRad(lat2 - lat1);
    var dLon = toRad(lon2 - lon1);
    var lat1 = toRad(lat1);
    var lat2 = toRad(lat2);

    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
    return Value * Math.PI / 180;
}

function calculateRate(total5Stars, total4Stars, total3Stars, total2Stars, total1Star) {
    return (5 * total5Stars + 4 * total4Stars + 3 * total3Stars + 2 * total2Stars + 1 * total1Star)
        / (total5Stars + total4Stars + total3Stars + total2Stars + total1Star)
}

let customerFeedBack = async (req, res) => {
    const { rate, comment, id } = req.body
    try {

        let lastRide = await db.ridesRequested.findFirst({
            where: {
                id: parseInt(id)
            }
        })

        await db.ridesRatesAndComments.create({
            data: {
                rideId: lastRide.id,
                user_id: req.user.id,
                comment: comment ?? '',
                rideRate: rate ?? 0
            }
        })

        return res.json({
            success: {
                success_en: 'Thank you for taking a trip with us.',
                success_ar: 'شكرا لطلب رحله من خلالنا.'
            }
        })

    } catch (e) {
        console.log(e)
        return false;
    }
}


let deleteRider = async (req, res) => {
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

                let user = await db.ride.findFirst({
                    where: {
                        user_id: req.user.id
                    }
                })

                if (!user) {
                    return res.status(403).send('User is not a rider')
                }

                await db.$queryRaw`SET FOREIGN_KEY_CHECKS=0;`
                await db.$queryRaw`DELETE FROM ride WHERE id = ${user.id}`
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

let ridersDashBoard = async (req, res) => {
    let { page } = req.query
    if (!page) page = 1;
    let maxTrips = 10

    let getRiderTrips = await db.ridesRequested.findMany({
        where: {
            rider_id: req.user.id,
            isDone: 1,
        },
        skip: page == 1 ? 0 : (page * maxTrips) - maxTrips,
        take: maxTrips,
    })

    let RiderProfit = await db.ridesRequested.aggregate({
        where: {
            rider_id: req.user.id,
            isDone: 1,
        },
        _sum: {
            total: true
        }
    })

    let riders5StarRating = await db.ridesRatesAndComments.count({
        where: {
            rideId: req.user.id,
            rideRate: 5
        }
    })

    let riders4StarRating = await db.ridesRatesAndComments.count({
        where: {
            rideId: req.user.id,
            rideRate: 4
        }
    })

    let riders3StarRating = await db.ridesRatesAndComments.count({
        where: {
            rideId: req.user.id,
            rideRate: 3
        }
    })

    let riders2StarRating = await db.ridesRatesAndComments.count({
        where: {
            rideId: req.user.id,
            rideRate: 2
        }
    })

    let riders1StarRating = await db.ridesRatesAndComments.count({
        where: {
            rideId: req.user.id,
            rideRate: 1
        }
    })


    let driverRate = calculateRate(riders5StarRating ?? 0,
        riders4StarRating ?? 0,
        riders3StarRating ?? 0,
        riders2StarRating ?? 0,
        riders1StarRating ?? 0
    )

    for (socket in sockets) {
        if (sockets[socket].user_id == req.user.id) {
            var lastDestination = sockets[socket].lastTrip
        }
    }

    let registerationForm = await db.ride.findFirst({
        where: {
            user_id: req.user.id
        },
        include: {
            riderPhoto: true
        }
    })

    return res.json({
        myTrips: getRiderTrips,
        myProfit: RiderProfit._sum.total,
        myRate: driverRate,
        myFinalDestination: lastDestination,
        myForm: registerationForm
    })
}

let modifyPriceRange = async (req, res) => {
    const { newPrice } = req.body

    if (!newPrice || isNaN(newPrice)) {
        return res.send('No price range was provided')
    }

    let checkIfUserisRider = await db.ride.findFirst({
        where: {
            user_id: req.user.id
        }
    })

    if (!checkIfUserisRider) {
        return res.send('Something went wrong')
    }

    await db.ride.update({
        where: {
            id: checkIfUserisRider.id
        },
        data: {
            distancePerKilo: parseFloat(newPrice)
        }
    })

    return res.json({
        success: {
            success_en: 'Price has been updated.',
            success_ar: 'تم التعديل.'
        }
    })
}

let driverInformation = async (riderId) => {
    let riderTotalTrips = await db.ridesRequested.aggregate({
        where: {
            rider_id: riderId,
            isDone: 1,
        },
        _count: {
            id: true
        }
    })

    let riders5StarRating = await db.ridesRatesAndComments.count({
        where: {
            rideId: riderId,
            rideRate: 5
        }
    })

    let riders4StarRating = await db.ridesRatesAndComments.count({
        where: {
            rideId: riderId,
            rideRate: 4
        }
    })

    let riders3StarRating = await db.ridesRatesAndComments.count({
        where: {
            rideId: riderId,
            rideRate: 3
        }
    })

    let riders2StarRating = await db.ridesRatesAndComments.count({
        where: {
            rideId: riderId,
            rideRate: 2
        }
    })

    let riders1StarRating = await db.ridesRatesAndComments.count({
        where: {
            rideId: riderId,
            rideRate: 1
        }
    })

    let driverRate = calculateRate(riders5StarRating ?? 0,
        riders4StarRating ?? 0,
        riders3StarRating ?? 0,
        riders2StarRating ?? 0,
        riders1StarRating ?? 0
    )

    var userInfo = await db.users.findFirst({
        where: {
            id: parseInt(riderId)
        },
        select: {
            profilePicture: true,
            firstName: true,
        }
    })

    let info = await db.ride.findFirst({
        where: {
            user_id: parseInt(riderId)
        }
    })

    return {
        totalTrips: riderTotalTrips,
        totalRate: driverRate,
        riderPhoto: userInfo.profilePicture,
        riderName: userInfo.firstName,
        carInfo: info
    }
}


module.exports = {
    addRider,
    acceptRide,
    findRiders,
    driversToggleStatus,
    updateDriversLocation,
    acceptPendingRide,
    addFinalDestination,
    deleteDriverProfile,
    changePricePerKilo,
    getDriverForm,
    getPriceViaDistance,
    customerFeedBack,
    endRide,
    deleteRider,
    ridersDashBoard,
    modifyPriceRange,
    driverInformation,
    cancelTrip,
    startRide
}