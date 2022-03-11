const express = require('express');

// Require the model
const User = require('../models/user');

const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// Add router - post method: this endpoint will allow users to register on website
router.post('/signup', (req, res, next) => {
  // .findOne method finds and returns one document that matches the given selection criteria / checks that a username isn't already taken
  User.findOne({ username: req.body.username })
    .then(user => {
      if (user) {
        const err = new Error(`User ${req.body.username} already exists!`);
        err.status = 403;
        return next(err);
      } else {
        User.create({
          username: req.body.username,
          password: req.body.password
        })
          .then(user => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ status: 'Registration Successful!', user: user });
          })
          .catch(err => next(err));
      }
    })
    .catch(err => next(err));
});

// post method: check if a user is already logged in
router.post('/login', (req, res, next) => {
  if (!req.session.user) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      const err = new Error('You are not authenticated!');
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
      return next(err);
    }

    const auth = Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(':');
    const username = auth[0];
    const password = auth[1];

    // check against the user document to authenticate login, first check the username
    User.findOne({ username: username })
      .then(user => {
        if (!user) {
          const err = new Error(`User ${username} does not exist!`);
          err.status = 401;
          return next(err);
          // if you find a matching username you can then check if the username and password match
        } else if (user.password !== password) {
          const err = new Error('Your password is incorrect!');
          err.status = 401;
          return next(err);
          // start tracking the user session
        } else if (user.username === username && user.password === password) {
          req.session.user = 'authenticated';
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/plain');
          res.end('You are authenticated!')
        }
      })
      // add catch block for an errors that might occur
      .catch(err => next(err));
  } else {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('You are already authenticated!');
  }
});

// final endpoint: 
router.get('/logout', (req, res, next) => {
  // check if a session exists
  if (req.session) {
    // .destroy - deleting the sesion file on the server side and if a client tries to authenticate using that sessions id it will be recognised by the server as a valid session
    req.session.destroy();
    // express method: clear the cookie that was stored on the client
    res.clearCookie('session-id');

    res.redirect('/'); //redirect the user
    // else block to handle if a client tries to logout if they're not logged in
  } else {
    const err = new Error('You are not logged in!');
    err.status = 401;
    return next(err);
  }
});


module.exports = router;
