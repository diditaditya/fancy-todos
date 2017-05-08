const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');
const bcrypt = require('bcrypt');
let saltRounds = 8;


let signupHelper = function(req, res, next) {
  let username = req.body.username;
  let email = req.body.email;
  let password = req.body.password;
  User.findOne({'local.username': username}, function(err, user) {
    if(err) {
      req.status = 'failed';
      return next(err);
    }
    if(user) {
      req.status = 'failed';
      req.message = 'username is already taken'
      next();
    } else {
      let newUser = new User();
      newUser.local.username = username;
      newUser.local.email = email;
      bcrypt.hash(password, saltRounds, function(err, hashed) {
        if(err) {
          req.status = 'failed';
          next(err);
        }
        newUser.local.password = hashed;
        newUser.save((err) => {
          if(err) {
            req.status = 'failed';
            throw err;
          }
          req.status = 'success';
          req.user = newUser;
          next();
        });
      });
    }
  });
}

module.exports = signupHelper;
