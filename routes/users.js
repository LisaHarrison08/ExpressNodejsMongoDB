const express = require('express');

// Require the model
const User = require('../models/user');
// Require passport
const passport = require('passport');

const authenticate = require('../authenticate');

const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// Add router - post method: this endpoint will allow users to register on website
router.post('/signup', (req, res) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {  //check if there is an error
      if (err) {
        res.statusCode = 500;  // lets the client know that there is an internal server error while trying to register
        res.setHeader('Content-Type', 'application/json'); //let the client know to expect a json response
        res.json({ err: err }); //provide information about the error
      } else {
        // check if firstname has been set in the request body
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
         // check if lastname has been set in the request body
        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }
        user.save(err => {
          if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({ err: err });
            return;
          }
          passport.authenticate('local')(req, res, () => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json({ success: true, status: 'Registration Successful!' });
          });
        });
      }
    }
  );
});

// post method: check if a user is already logged in and successful
router.post('/login', passport.authenticate('local'), (req, res) => {
  const token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'You are successfully logged in!' });
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
