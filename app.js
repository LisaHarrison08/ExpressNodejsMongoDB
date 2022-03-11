var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const campsiteRouter = require('./routes/campsiteRouter');
const promotionRouter = require('./routes/promotionRouter');
const partnerRouter = require('./routes/partnerRouter');

const mongoose = require('mongoose');

const url = 'mongodb://127.0.0.1/nucampsite';
const connect = mongoose.connect(url, {
  useCreateIndex: true,
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true
});
// handle the promise that's returned
connect.then(() => console.log('Connected correctly to server'),
  // if the connection does not succeed set up the error handling
  err => console.log(err)
);

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// provide the cookie parser with a secret key (any string) as an argument. A cryptographic key that can be used by the cookie parser in order encrypt the information and sign the cookie that is sent from the server to the client
app.use(cookieParser('12345-67890-09876-54321'));

// Authentication middleware
function auth(req, res, next) {
  // if the cookie is not properly signed it will return a value of false
  if (!req.signedCookies.user) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    // Buffer is a global class in Node - it can be used without importing any module. from is a static method from Buffer
    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const user = auth[0];
    const pass = auth[1];
    // here's where the user that has not been authenticated has been challenged for a user name and password and has sent that information back to the server and it is correct
    if (user === 'admin' && pass === 'password') {
      // set up a cookie - res.cookie method is part of express's response objects API - use it to create new cookie by passing it the name that we want to use for the cookie 'user' and this name will be used tosetup a property of user on the sign cookie object 
      // 2nd argument will be a value to store in the name property, given the string of 'admin'
      // 3rd argument is optional and is an object that contains configuration values. In this case, setting the property 'signed' to true, we let express know to use the secret key from cookie parser to create a signed cookie. The rest.cookie method handles creating the cookie and settin git up in the server's response to the client
      res.cookie('user', 'admin', { signed: true });
      return next(); // authorized
    } else {
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }
    // if there is a signed cookie.user value in the incoming request we'll check to see if that value === admin, if so pass client on to next middleware function  and grant access
  } else {
    if (req.signedCookies.user === 'admin') {
      return next(); // authorized, grant access      
    } else {
      const err = new Error('You are not authenticated!');
      err.status = 401;
      return next(err);
    }
  }
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.use('/campsites', campsiteRouter);
app.use('/promotions', promotionRouter);
app.use('/partners', partnerRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
