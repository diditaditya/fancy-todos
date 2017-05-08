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
      return next(err);
    }
    if(user) {
      let message = 'username is already taken';
      next({'message': message});
    } else {
      let newUser = new User();
      newUser.local.username = username;
      newUser.local.email = email;
      bcrypt.hash(password, saltRounds, function(err, hashed) {
        if(err) {
          next(err);
        }
        newUser.local.password = hashed;
        newUser.save((err) => {
          if(err) {
            throw err;
          }
          next();
        });
      });
    }
  });
}

module.exports = signupHelper;
