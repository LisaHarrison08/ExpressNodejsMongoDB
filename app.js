var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const session = require('express-session');
const FileStore = require('session-file-store')(session);

// Require passport
const passport = require('passport');
const authenticate = require('./authenticate');

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
// app.use(cookieParser('12345-67890-09876-54321'));

// session middleware common options set:
app.use(session({
  name: 'session-id',
  secret: '12345-67890-09876-54321',
  saveUninitialized: false,   // when no updates are made to the new session,at the end of the request it won't get saved because it will be an empty session & no cookie will be sent to the client
  resave: false, // once a session has been created updated and saved, it will continue to be resaved whenever a request is made for that session - this will help with keeping this session marked as active
  store: new FileStore() // create a new filestore as an object used to save our session info to the servers hard disk instead of just in the running application memory
}));

// Only necessary if using session based authentication, these are two middleware functions provided by passport to check incoming requests to see if there is an existing session for that client and if so the data is loaded
app.use(passport.initialize());
app.use(passport.session());

app.use('/', indexRouter);
app.use('/users', usersRouter);

// Authentication function
function auth(req, res, next) {
  console.log(req.user);

  if (!req.user) {
    const err = new Error('You are not authenticated!');
    err.status = 401;
    return next(err);
  } else {
    return next();
  }
}

app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));

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
