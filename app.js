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
const admin  = require('firebase-admin')



initializeApp({
  credential: applicationDefault(),
}); 



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
var Reels = require('./routes/Reels&stories')

var app = express();

// Create the http server
const server = require('http').createServer(app);
  
// Create the Socket IO server on 
// the top of http server
/*
const io = socketio(server, {
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
app.use('/reels', Reels)

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
