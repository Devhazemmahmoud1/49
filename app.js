var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
var socketio = require("socket.io");
const s3 = require('./controllers/s3Controller/s3Configiration')
const admin = require('firebase-admin/app');
const admins = require('firebase-admin')
const secretKey = "fourtyninehub495051fourtynine";
const Jwt = require('jsonwebtoken');
const serviceAccount = require('./foutrynine-firebase.json');
const moment = require('moment');

admin.initializeApp({
  credential: admin.cert(serviceAccount),
});

// admins.messaging().send({
//   token: 'doOoBpo9QfGYobzUcRlD7K:APA91bHgPwc5LmGLGjUngkmpLn1AiXy8JLGqhYem62k1iaS3_lodVO2qnfANTZ-K9KGtJWguu5x4yW_RrHciU98HtvqjVImIaGmkwkCuhpR2u7eyL3hRpF0qI-6lmP0xwiJxT1GT4e66',
//   notification: {
//     title: 'Hello notification',
//     body: 'This is a notification',
//   }
// });

var cronJob = require('./controllers/cronJob/cronJobController')
var cashBackCronJob = require('./controllers/cronJob/cashBackCronJobController')

// Routes // 
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var categoriesRouter = require('./routes/categories');
var services = require('./routes/services')
var profit = require('./routes/profits')
var riders = require('./routes/riders')
var customer = require('./routes/transCustomer')
var loading = require('./routes/loading')
var resturants = require('./routes/resturants')
var health = require('./routes/Health')
var ads = require('./routes/ads')
var so = require('./routes/socketHandler')
var settings = require('./routes/setting')
var socialProfile = require('./routes/socialMediaRoutes/profile')
var actions = require('./routes/socialMediaRoutes/usersAction')
var Reels = require('./routes/Reels&stories')
var notification = require('./routes/notifications')
var paymob = require('./routes/payments/PayMob');
var packages = require('./routes/packages')
//const { sockets } = require('./controllers/socketController/socketController');
var app = express();

// Create the http server
const server = require('http').createServer(app);
//const https = require('https').createServer(options, app)

// Create the Socket IO server on 
// the top of http server

global.io = socketio(server, {
  maxHttpBufferSize: 100000000,
  connectTimeout: 5000,
  transports: ['websocket', 'polling'],
  pingInterval: 5 * 1000,
  pingTimeout: 5000,
  allowEIO3: true,
  allowRequest: (req, callback) => {
    callback(null, true);
  },
  cors: {
    origin: "http://localhost:8888",
    methods: ["GET", "POST"],
  }
});


app.use((req, res, next) => {
  req.io = io;
  return next();
});

// Add Access Control Allow Origin headers
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('uploads'))

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/categories', categoriesRouter)
app.use('/services', services)
app.use('/profit', profit)
app.use('/ride', riders)
app.use('/transport', customer);
app.use('/loading', loading)
app.use('/resturants', resturants)
app.use('/health', health)
app.use('/ads', ads)
app.use('/socket', so)
app.use('/setting', settings);
app.use('/social/profile', socialProfile)
app.use('/social/actions', actions)
app.use('/reels', Reels)
app.use('/notify', notification)
app.use('/payment', paymob)
app.use('/packages', packages)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.status(err.status || 500);
  res.send({
    // status: err.status || 500,
    error: {
      error_en: err.message ?? err,
      error_ar: err.message ?? err,
    }
  });
  console.log(err)
});

//var socket = require('./controllers/socketController/socketController')
global.sockets = {}
io.on('connection', async (socket) => {
  if (socket.handshake.headers.authorization.includes('Bearer ')) {
    if (socket.user.id != null) {
      let userInfo = {
        socket_id: socket.id,
        firstName: socket.user.firstName,
        lastName: socket.user.lastName,
        user_id: socket.user.id,
        userType: socket.user.accountType ?? 0,
        isApproved: socket.user.isApproved,
        isReady: true,
        status: socket.status ?? null,
        token: socket.token,
        subscription: socket.subscription ?? null,
        isPersonalAccount: socket.subscription != null ? socket.subscription.isPersonalAccount : null,
        lastTrip: {
          destinationAddress: null,
          lat: null,
          lng: null
        },
        currentLocation: {
          lat: socket.handshake.headers.lat ?? null,
          lng: socket.handshake.headers.lng ?? null,
        }
      }

      if (Object.keys(sockets).length != 0) {
        console.log('passed Here')
        for (sockett in sockets) {
          if (sockets[sockett].user_id == socket.user.id) {
            console.log('was there and deleted');
            delete sockets[sockett]
            sockets[socket.id] = userInfo
          } else {
            console.log('passed')
            sockets[socket.id] = userInfo
          }
          break;
        }
      } else {
        sockets[socket.id] = userInfo
        console.log('passed Here Please')
        console.log(sockets[socket.id])
      }
      console.log(sockets[socket.id])
    }
  }

  socket.on('change-price', async (data) => {
    var price = JSON.parse(data).price
    var distance = JSON.parse(data).distance
    var userType = JSON.parse(data).userType
    var From = JSON.parse(data).streetFrom
    var To = JSON.parse(data).streetTo
    var lat = JSON.parse(data).customerLat
    var lng = JSON.parse(data).customerLng
    var destinationLat = JSON.parse(data).destinationLat
    var destinationLng = JSON.parse(data).destinationLng
    var tripTime = JSON.parse(data).tripTime

    for (socket in sockets) {
      if (sockets[socket].user_id == JSON.parse(data).user_id) {
        var requestTo = sockets[socket].socket_id
        var userId = sockets[socket].user_id
      }

      if (sockets[socket].user_id == JSON.parse(data).rider_id) {
        var requestFrom = sockets[socket].user_id
        var riderId = sockets[socket].user_id


        let riderTotalTrips = await db.ridesRequested.aggregate({
          where: {
            rider_id: sockets[socket].user_id,
            isDone: 1,
          },
          _count: {
            id: true
          }
        })

        let riders5StarRating = await db.ridesRatesAndComments.count({
          where: {
            rideId: sockets[socket].user_id,
            rideRate: 5
          }
        })

        let riders4StarRating = await db.ridesRatesAndComments.count({
          where: {
            rideId: sockets[socket].user_id,
            rideRate: 4
          }
        })

        let riders3StarRating = await db.ridesRatesAndComments.count({
          where: {
            rideId: sockets[socket].user_id,
            rideRate: 3
          }
        })

        let riders2StarRating = await db.ridesRatesAndComments.count({
          where: {
            rideId: sockets[socket].user_id,
            rideRate: 2
          }
        })

        let riders1StarRating = await db.ridesRatesAndComments.count({
          where: {
            rideId: sockets[socket].user_id,
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

        var driver = {
          totalTrips: riderTotalTrips,
          totalRate: driverRate,
          riderPhoto: userInfo.profilePicture,
          riderName: userInfo.firstName,
          carInfo: info
        }
      }
    }

    function calculateRate(total5Stars, total4Stars, total3Stars, total2Stars, total1Star) {
      return (5 * total5Stars + 4 * total4Stars + 3 * total3Stars + 2 * total2Stars + 1 * total1Star)
        / (total5Stars + total4Stars + total3Stars + total2Stars + total1Star)
    }

    io.to(requestTo).emit('agent-new-changed-price', JSON.stringify({
      rider_id: riderId,
      user_id: userId,
      price: price,
      distance: distance,
      userType: userType,
      streetFrom: From,
      streetTo: To,
      customerLng: lng,
      customerLat: lat,
      destinationLat: destinationLat,
      destinationLng: destinationLng,
      tripTime: tripTime,
      freeRide: JSON.parse(data).freeRide,
      driverInfo: driver,
    }));

    console.log('event emitted')

  })

  socket.on('disconnect', () => {
    console.log(socket.id + ' is out from here')
    delete sockets[socket.id]
    console.log(socket.id + ' Was deleted')
  })
})

io.use(async (socket, next) => {
  try {

    let token = socket.handshake.headers.authorization
    if (!token) {
      console.log("socket auth be provided !")
      throw new Error("auth must be provided !")
    }

    let authorization = token.split('Bearer ')[1]
    Jwt.verify(authorization, secretKey, async (err, data) => {
      if (err) throw err;

      let user = await db.users.findFirst({
        where: {
          id: parseInt(data.id) ?? undefined
        },
        select: {
          firstName: true,
          lastName: true,
          email: true,
          id: true,
          isApproved: true,
          accountType: true,
        }
      });
      if (!user) {
        socket.user = null
        socket.token = null
        socket.subscription = null
        next();
      }

      let userSubscription = await db.subscriptions.findFirst({
        where: {
          user_id: parseInt(data.id)
        },
        orderBy: {
          'created_at': 'desc'
        }
      })

      if (userSubscription) {
        if (moment(userSubscription.updated_at).add(userSubscription.period, 'days').format('YYYY/MM/DD HH:mm:ss') >= moment().format('YYYY/MM/DD HH:mm:ss')) {

          console.log('passed')
          // subscription still on
          socket.subscription = {
            categoryId: userSubscription.subCat_id,
            permium: userSubscription.isPermium,
            stauts: 1,
            isPersonalAccount: userSubscription.isPersonalAccount,
            CounterStaterd: userSubscription.packageCounter != null,
            startDate: userSubscription.updated_at,
          }
        }
      } else {
        socket.subscription = null
      }

      // check if he has any trips going on 
      let checkTrip = await db.ridesRequested.findFirst({
        where: {
          rider_id: data.id,
        },
        orderBy: {
          created_at: 'desc'
        }
      })

      if (checkTrip) {
        var getUserInfo = await db.users.findFirst({
          where: {
            id: checkTrip.client_id
          }
        })
      }


      if (checkTrip && checkTrip.isDone == 0 && checkTrip.isPendding != 1) {
        io.to(socket.socket_id).emit('current-trip', JSON.stringify({
          user_id: parseInt(getUserInfo.id),
          rideId: checkTrip.id,
          rider_id: parseInt(checkTrip.rider_id),
          distance: checkTrip.distance.toString(),
          tripTime: checkTrip.tripTime.toString(),
          customerLng: checkTrip.customerLng.toString(),
          customerlat: checkTrip.customerlat.toString(),
          destinationLng: checkTrip.destinationLng.toString(),
          destinationLat: checkTrip.destinationLat.toString(),
          streetFrom: checkTrip.streetFrom.toString(),
          streetTo: checkTrip.streetTo.toString(),
          total: parseInt(checkTrip.total),
        }))
        socket.status = 1
      }

      if (checkTrip && checkTrip.isDone == 0 && checkTrip.isPendding == 1) {
        io.to(socket.socket_id).emit('current-trip', JSON.stringify({
          user_id: parseInt(getUserInfo.id),
          rideId: checkTrip.id,
          rider_id: parseInt(checkTrip.rider_id),
          distance: checkTrip.distance.toString(),
          tripTime: checkTrip.tripTime.toString(),
          customerLng: checkTrip.customerLng.toString(),
          customerlat: checkTrip.customerlat.toString(),
          destinationLng: checkTrip.destinationLng.toString(),
          destinationLat: checkTrip.destinationLat.toString(),
          streetFrom: checkTrip.streetFrom.toString(),
          streetTo: checkTrip.streetTo.toString(),
          total: parseInt(checkTrip.total),
        }))
        socket.status = 2
      }

      if (!checkTrip || checkTrip.isDone == 1 && checkTrip.isPendding == 0) {

        io.to(socket.socket_id).emit('current-trip', JSON.stringify({
            test: "test"
        }))

        socket.status = null
      }

      socket.user = user;
      socket.token = authorization
      next();
    });

  } catch (e) {
    console.log("socket cant connect because => " + e.toString())
    next(Error(e.toString()))
  }
});

module.exports = { app, server }

