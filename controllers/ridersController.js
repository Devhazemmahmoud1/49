var express = require('express')
const { PrismaClient } = require('@prisma/client')
const db = new PrismaClient();
const moment = require('moment');

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


/* Find drivers around 5 KMs */
let findRiders = async (req, res) => {
    const { userType, From, To, distance, price, lat, lng, destinationLng, destinationLat, tripTime } = req.query
    console.log(Object.keys(sockets).length)
    if (Object.keys(sockets).length !== 0) {
        for (socket in sockets) {
            sockets[socket].subscription = {
                categoryId: 897,
                permium: 1,
                stauts: 1,
                startDate: '2022-06-21 22:14:55.000',
              }
            if (sockets[socket].userType == userType
                && sockets[socket].isReady == true
                && sockets[socket].currentLocation.lat != ''
                && sockets[socket].currentLocation.lng != ''
                && sockets[socket].isApproved != 0) {

                console.log("23232" + sockets[socket])
                console.log(sockets[socket].subscription)
                // we need to check if this driver has already subscribed   
                if (sockets[socket].subscription == null) {
                    global.io.to(sockets[socket].socket_id).emit('no-subscription', JSON.stringify(
                        {
                            // message_ar: `لديك طلبات توصيله و لكنك غير مشترك اليوم من فضلك اشترك حتي تواصل العمل معنا`,
                            // message_en: 'You have ride requests but you did not subscribe today , Please subscribe to keep taking trips.',
                            user_id: req.user.id,
                            price: price ?? 50,
                            message_ar: `قام ${req.user.firstName} بطلب رحله من ... الي ... بسعر 50 جنيه`,
                            message_en: req.user.firstName + ' Has requested a ride from' + From + ' to' + To + ' ' + 'for 50 L.E',
                            distance: distance ? distance + ' KiloMeters' : 'Unknown',
                            userType: userType,
                            destinationFrom: From,
                            destinationTo: To,
                            customerLng: lng,
                            customerLat: lat,
                            destinationLat: destinationLat,
                            destinationLng: destinationLng,
                            tripTime: tripTime
                        }
                    ));
                    continue;
                }

                if (moment(sockets[socket].subscription.startDate).add(sockets[socket].subscription.period, 'days').format('YYYY/MM/DD HH:mm:ss') >= moment().format('YYYY/MM/DD HH:mm:ss')) {
                    console.log('passed' + sockets[socket].subscription)
                    console.log(sockets[socket].subscription)
                    global.io.to(sockets[socket].socket_id).emit('no-subscription', JSON.stringify(
                        {
                            // message_ar: `لديك طلبات توصيله و لكنك غير مشترك اليوم من فضلك اشترك حتي تواصل العمل معنا`,
                            // message_en: 'You have ride requests but you did not subscribe today , Please subscribe to keep taking trips.',
                            user_id: req.user.id,
                            price: price ?? 50,
                            message_ar: `قام ${req.user.firstName} بطلب رحله من ... الي ... بسعر ${price ?? 0} جنيه`,
                            message_en: req.user.firstName + `Has requested a ride from ${From} to ${To}   for ${price ?? 0}`,
                            distance: distance ? distance + ' Km' : 'Unknown',
                            userType: userType,
                            destinationFrom: From,
                            destinationTo: To,
                            customerLng: lng,
                            customerLat: lat,
                            destinationLat: destinationLat,
                            destinationLng: destinationLng,
                            tripTime: tripTime
                        }
                    ));
                    continue;
                }


                if (sockets[socket].lastTrip.lat != null && sockets[socket].lastTrip.lng != null && destinationLng && destinationLat) {
                    console.log('final destination')
                    let calculateDistance = calcCrow(sockets[socket].lastTrip.lat, sockets[socket].lastTrip.lng, destinationLat, destinationLng).toFixed(1)
                    console.log("distance =" + calculateDistance)
                    if (calculateDistance > 5) continue;
                    global.io.to(sockets[socket].socket_id).emit('request', JSON.stringify(
                        {
                            user_id: req.user.id,
                            price: price ?? 50,
                            message_ar: `قام ${req.user.firstName} بطلب رحله من ... الي ... بسعر 50 جنيه`,
                            message_en: req.user.firstName + ' Has requested a ride from' + From + ' to' + To + ' ' + 'for 50 L.E',
                            distance: distance ? distance + ' KiloMeters' : 'Unknown',
                            userType: userType,
                            destinationFrom: From,
                            destinationTo: To,
                            customerLng: lng,
                            customerLat: lat,
                            destinationLat: destinationLat,
                            destinationLng: destinationLng,
                            tripTime: tripTime
                        }
                    ));
                    continue;
                }

                let calculateDistance = calcCrow(lat, lng, sockets[socket].currentLocation.lat, sockets[socket].currentLocation.lng).toFixed(1)
                console.log("distance1 =" + calculateDistance)
                if (calculateDistance > 5) continue;
                global.io.to(sockets[socket].socket_id).emit('request', JSON.stringify(
                    {
                        user_id: req.user.id,
                        price: price ?? 50,
                        message_ar: `قام ${req.user.firstName} بطلب رحله من ... الي ... بسعر 50 جنيه`,
                        message_en: req.user.firstName + ' Has requested a ride from ' + From + ' to' + To + ' ' + ' for 50 L.E',
                        distance: distance ? distance + ' KiloMeters' : 'Unknown',
                        userType: userType,
                        destinationFrom: From,
                        destinationTo: To,
                        customerLng: lng,
                        customerLat: lat,
                        destinationLat: destinationLat,
                        destinationLng: destinationLng,
                        tripTime: tripTime
                    }
                ));
            }
            continue;
        }
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

    return res.send('Status has been toggled')
}

/* Update all users location */
let updateDriversLocation = async (req, res) => {
    const { driver } = req.body
    for (socket in sockets) {
        if (sockets[socket].userType != '0' && sockets[socket].user_id == req.user.id) {
            sockets[socket].currentLocation.lat = driver.lat ?? null
            sockets[socket].currentLocation.lng = driver.lng ?? null
            break;
        }
    }
    console.log("Drivers" + sockets)
    return res.send(sockets)
}

/* Calculate total price  */
let getPriceViaDistance = async (req, res) => {
    const { subCategory, distance } = req.params 

    if (! subCategory) {
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
let addPendingRide = async (req, res) => {

}

// accept a ride 
let acceptRide = async (req, res) => {
    const {
        user_id,
        rider_id,
        distance,
        tripTime,
        customerLng,
        customerlat,
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
        !customerlat ||
        !destinationLat ||
        !destinationLng ||
        !streetFrom ||
        !streetTo ||
        !total
    )

        return res.status(403).send('Something went wrong');

    try {
        // inserting a new 
        let ride = await db.ridesRequested.create({
            data: {
                client_id: parseInt(user_id),
                rider_id: parseInt(rider_id),
                distance: distance,
                tripTime: tripTime,
                customerLng: customerLng,
                customerlat: customerlat,
                destinationLng: destinationLng,
                destinationLat: destinationLat,
                streetFrom: streetFrom,
                streetTo: streetTo,
                total: total,
            }
        })

        for (socket in sockets) {
            if (sockets[socket].user_id == ride.rider_id) {
                sockets[socket].status = 1
            }
        }

        return res.send('ok')

    } catch (e) {
        throw new e
    }
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
    return (5*total5Stars + 4*total4Stars + 3*total3Stars + 2*total2Stars + 1*total1Star)
        / (total5Stars+total4Stars+total3Stars+total2Stars+total1Star)
}

let customerFeedBack = async (req ,res) => {
    const { rate, comment } = req.body
    try {

        let lastRide = await db.ridesRequested.findFirst({
            where: {
                client_id: req.user.id
            },
            orderBy: {
                created_at: 'desc'
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
        throw new e 
    }   
}

module.exports = {
    addRider,
    acceptRide,
    findRiders,
    driversToggleStatus,
    updateDriversLocation,
    addPendingRide,
    addFinalDestination,
    deleteDriverProfile,
    changePricePerKilo,
    getDriverForm,
    getPriceViaDistance,
    customerFeedBack
}