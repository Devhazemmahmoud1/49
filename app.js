var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
var socketio = require("socket.io");
const s3 = require('./controllers/s3Controller/s3Configiration')
const { initializeApp } = require('firebase-admin/app');



/*
initializeApp({
  credential: applicationDefault(),
  databaseURL: '',
  "type": "service_account",
  "project_id": "fortynine-f60ad",
  "private_key_id": "eba55dd9e922112f82d3535dfc2b63b6c874595c",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDSDbxp7JjYBJhw\nJJkbrPQU5ICFuQW+abBygEhXEFGjERoFbOEKW0aHHRs7vwslrb8GO83q2QK76lSu\nw3YIWMC1HeYe9nIJv1F0zetJFrVu5MSDM59DW6f/5f69ROI1TDrCj2OqWLiT+KBE\nl1es4YIP+WnVcXobxjwUWpe47xQlxEH4kPLNFNgqqFJKE2gN4ovCkeG5gqjjmtrQ\nK5vInepKJn+MRFgJ83UQiStcQIu0kEa0dstuHS073EwJzC2iqJHpcT9BiefnXFX/\n+lOxekIaXsadvMQR0UNMCIqBD6sxqXQDtUman5/7b14HvsiTsMtsXe2xLDv2tVAC\nO7as2FvlAgMBAAECggEAAeknfGi66AXH86m/BOULQaIIlM7TOLW5dYR1LLs2BXI+\nIQ8BSeAURemCQW7974kDU1tlOvmOhj3yS8IMMalJ7jSSZh3uvyIWvULh0UnGHg5g\nL4ZZh+uIi/2Uip7PIhA2Ec7IyptJ9Oj+jd2Ke2H0Z6HXNg0YGCbnPIG1R2M56Vnu\nE3fZa5h7TyO54RWKntkH2ceWLbnumM3HaW+6kBwHKUM+wUMdBmkY9fwnjzNEBtm3\nioHz5bicA7iRWtYQH52IYIDzI8jmihLnz3xLttc+DnkjIWRWe6+s4y6n880UkUtX\nlfJG9R+5weY77aVlhrxSNqnRS4ImVnNe9iQ8aqMcYQKBgQDu1qHVPa98gDRwJchD\nzXiLJpaDzeGnHKazKy/ZkibhPsN7B74AobvswgCJlwK99CeIY1tuKhnXuOHrPxse\nWuhZxTvLycs/ukJJD3v0c25x5WL+p9A/E3PzxlpNQ97QCEmGER1RYUwhkHsXaJd7\nzhurtN93CuQH9xH/swCLLpurhQKBgQDhJZ27Be1tFUswLAScLKeTy30O/QCFPjL7\nO/1Ph9lX1aSI9cB45Ch15PINzTPAaMqjYcTZPkqEDJcDj94i6HN77LaBwyEAFKsT\npuQdxqNw67bYPJOOp6bu+/7GYKwCJVgEbTYsJcmEVj+Q38wVGJBzkRtEURYYjQpw\nwRj8pMjs4QKBgQCsGYzTk3d4RwmCJjeAY/aQjmW25AvN1x9ny57XMDFD7W3+oT2Q\nRvqbR9ALVP1s0xoJdU7UuxGUGGzyjq6D2Q3EYhMMbYQ/j39kFfxD0UmsWJZU2ad9\nTA8pgaxgMJ/FV7NjH8H4ehvZs7p+y6ccVxApUlQT+40FEEuv7NRfdl5F4QKBgQCf\nppTacbGSkG7okc4TEHckDj93yV/9G8X68OcG5kXwSsaJd/orv14Re29I6iGwZp6K\njGGRyuH8ERFkrTfPeRWq4ofoK/3SmNVW8hkAJELxZ7QYUZwwpCFzha177kEKpIBt\nYyPu2jyzYpVgndGRhAGqcVLsdrM8ZYbpvYOCYzc3AQKBgQCkfZy8RUnhZctl5ClV\ny4ywggmpGFguO2RDbkhN7lQD/EYKmNuKa5EwsYfBHWHgPrz0FAT1/ijb05kdn4WK\nxVvI5/4hDO2Hh7n6Ll1tMhHzztTZ2gbTw055B6Ggm/V/xwv5wPb10gWRl7GZ+2Qh\nPJZUUjhwO9iNbolKTnl2clCeXw==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-u6af4@fortynine-f60ad.iam.gserviceaccount.com",
  "client_id": "109072964973510012964",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-u6af4%40fortynine-f60ad.iam.gserviceaccount.com"
}); 
*/


var cronJob = require('./controllers/cronJob/cronJobController')
var cashBackCronJob = require('./controllers/cronJob/cashBackCronJobController')
var socket = require('./controllers/socketController')
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

var app = express();

// Create the http server
const server = require('http').createServer(app);
  
// Create the Socket IO server on 
// the top of http server
/*const io = socketio(server, {
  cors: {
    origin: "http://localhost:8888",
    methods: ["GET", "POST"]
  }
});

app.use((req, res, next) => {
  req.io = io;
  return next();
}); 
*/

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


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/*
var sockets = []

io.on('connection', (socket) => {
  sockets.push({
    socket_id: socket.id,
    user_id: 10,
  })
  console.log(socket.id + ' Has connected to the channel')

  socket.on('disconnect', () => {
    console.log(socket.id + ' is out from here')
  })
})
*/

module.exports = { app, server }
