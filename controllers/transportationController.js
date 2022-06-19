const express = require('express');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();

/* Request a ride */
let makeRide = async (request, response) => {
    const { lng, lat, lngDestination, latDestination, price } = request.body 
    
    if (! lng || ! lat || ! lngDestination || !latDestination || !price) {
        return response.status(403).json({
            error: {
                error_en: 'Please fill out all fields',
                error_ar: 'من فضلك قم بادخال جميع البيانات المطلوبه'
            }
        })
    }

    // make a request
    try {
        await db.ridesPendingRequests.create({
           data: {
               client_id: request.user.id,
               total: price.toString(),
               lng: lng.toString(),
               lat: lat.toString(),
               toLng: lngDestination.toString(),
               toLat: latDestination.toString(),
           }   
        })
    } catch (error) {
        return response.status(403).json(error)
    }

    return response.status(200).send('ok');
}


/* calculate the distance between two points on the map */
async function calculateDistance(req, res) 
{
  const { lat1, lon1, lat2, lon2 } = req.body 
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat12 = toRad(lat1);
  var lat22 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat12) * Math.cos(lat22); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  
  let lowestRider = await db.ride.findFirst({ orderBy: { distancePerKilo: 'asc' } })

  let highestRider = await db.ride.findFirst({ orderBy: { distancePerKilo: 'desc' } })

  let totalDistance = parseInt(d.toFixed(1)) + 1

  let result = {
    totalDistance: totalDistance,
    totalRidePrice: {
        'from': lowestRider.distancePerKilo * totalDistance,
        'to': highestRider.distancePerKilo * totalDistance,
    }
  }

  return res.status(200).json(result);
}

// Converts numeric degrees to radians
function toRad(Value) 
{
    return Value * Math.PI / 180;
}

module.exports = { makeRide, calculateDistance }