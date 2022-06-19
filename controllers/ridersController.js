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
    const { userType, From, To, distance, price, lat, lng, destinationLng, destinationLat } = req.query
    console.log(Object.keys(sockets).length)
    if (Object.keys(sockets).length !== 0) {
        for (socket in sockets) {
            if (sockets[socket].userType == userType
                && sockets[socket].isReady == true
                && sockets[socket].currentLocation.lat != ''
                && sockets[socket].currentLocation.lng != ''
                && sockets[socket].isApproved != 0) {
                    
                    console.log("23232" + sockets[socket])

                if (sockets[socket].lastTrip != null && destinationLng && destinationLat) {
                    console.log('final destination')
                    let calculateDistance = calcCrow(sockets[socket].lastTrip.lat, sockets[socket].lastTrip.lng, destinationLat, destinationLng).toFixed(1)
                    console.log("distance =" + calculateDistance)
                    if (calculateDistance > 5) continue;
                    global.io.to(sockets[socket].socket_id).emit('request', JSON.stringify(
                        {
                            user_id: req.user.id,
                            price: price ?? 50,
                            message_ar: `قام ${req.user.firstName} بطلب رحله من ... الي ... بسعر 50 جنيه`,
                            message_en: req.user.firstName + ' Has requested a ride from' + From + ' to' + To + '' + 'for 50 L.E',
                            distance: distance ? distance + ' KiloMeters' : 'Unknown'
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
                        message_en: req.user.firstName + ' Has requested a ride from' + From + ' to' + To + '' + 'for 50 L.E',
                        distance: distance ? distance + ' KiloMeters' : 'Unknown'
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
        if (sockets[socket].userType != '0' && sockets[socket].user_id == driver.user_id) {
            sockets[socket].currentLocation.lat = driver.lat ?? null
            sockets[socket].currentLocation.lng = driver.lng ?? null
            break;
        }
    }
    console.log("Drivers" + sockets)
    return res.send(sockets)
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
            ! user_id ||
            ! rider_id ||
            ! distance ||
            ! tripTime ||
            ! customerLng ||
            ! customerlat ||     
            ! destinationLat || 
            ! destinationLng ||
            ! streetFrom ||
            ! streetTo ||
            ! total
        ) 

        return res.status(403).send('Something went wrong');

        try {

            // inserting a new 
            await db.ridesRequested.create({
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
                    total: total
                }
            })

            return res.send('ok')

        } catch (e) {
            throw new e
        }
}

let addFinalDestination = async (req, res) => {
    const { lng, lat } = req.body

    if (! lng || ! lat) return res.send('No lat or lng provided');

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

module.exports = { addRider, acceptRide, findRiders, driversToggleStatus, updateDriversLocation, addPendingRide, addFinalDestination }