var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
var socketio = require("socket.io");
const s3 = require('./controllers/s3Controller/s3Configiration')
const { initializeApp, applicationDefault } = require('firebase-admin/app');
const admin = require('firebase-admin')
const secretKey = "fourtyninehub495051fourtynine";
const socketUserHandler = require('./middleware/socketHandler')
const Jwt = require('jsonwebtoken');

initializeApp({
  credential: applicationDefault(),
});

admin.messaging().send({
  data: {
      senderInfo: "1",
      postId: "1" ?? "0",
      type: "1"
  },  
  token: "f6_HcMEtRFSznJm3t7FZLn:APA91bHWBuX_ElCu-UDxdmX0qWo68HNhcOjn5SpNNw1KFbdtMMB93t0HRoQLYh9-VRFxt4uqYjTeb_J2pI1Z-QR_WxkdJSlshmmOunc4bPnzQGAZ9p1HIGt8jToq3kXOOtniqO0fwY2u",
  notification: {
    title: 'New notification',
    body:  "Hello",
  }
})

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
var paymob = require('./routes/payments/PayMob')

var app = express();

// Create the http server
const server = require('http').createServer(app);

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
        user_id: socket.user.id,
      }
      sockets[socket.id] = userInfo
    }
  }

  socket.on('disconnect', () => {
    console.log(socket.id + ' is out from here')
    delete sockets[socket.id]
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
        }
      });
      if (!user) {
         socket.user = null
         next();
      }
      socket.user = user;
      next();
    });

  } catch (e) {
    console.log("socket cant connect because => " + e.toString())
    next(Error(e.toString()))
  }
});

module.exports = { app, server, io, sockets }

