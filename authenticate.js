
// Require thepassport middleware
const passport = require('passport');

// Require the localstrategy
const LocalStrategy = require('passport-local').Strategy;

// Require user model
const User = require('./models/user');


exports.local = passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
