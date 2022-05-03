var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const { PrismaClient } = require('@prisma/client');
const db = new PrismaClient();
var io = require('socket.io')(3001), socket = []

var cronJob = require('./controllers/cronJobController')

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

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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

module.exports = app;
