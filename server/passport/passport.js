const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/user');
const bcrypt = require('bcrypt');
let saltRounds = 8;
const jwt = require('jsonwebtoken');

// passport.use('local-signup', new LocalStrategy(
//   function(username, email, password, done) {
//     console.log('username: ', username);
//     console.log('email: ', email);
//     console.log('password: ', password);
//     User.findOne({'local.username': username}, function(err, user) {
//       if(err) {
//         return done(err);
//       }
//       if(user) {
//         return done(null, {message: 'username is already taken'})
//       } else {
//         let newUser = new User();
//         newUser.local.username = username;
//         newUser.local.email = email;
//         console.log(password);
//         bcrypt.hash(password, saltRounds, function(err, hashed) {
//           if(err) {
//             return done(err);
//           }
//           newUser.local.password = hashed;
//           newUser.save((err) => {
//             if(err) {
//               throw err;
//             }
//             return done(null, newUser);
//           });
//         });
//       }
//     });
//   }
// ));

passport.use('local-signin', new LocalStrategy(
  function(username, password, done) {
    User.findOne({'local.username': username}, function(err, user) {
      if(err) {
        return done(err);
      }
      if(!user) {
        return done(null, {status: 'failed', message: 'Username is not found'});
      }
      if(user) {
        console.log('given password: ', password);
        console.log('stored password: ', user.local.password);
        bcrypt.compare(password, user.local.password, function(err, res) {
          console.log('res: ', res);
          if(err) {
            return done(err, {status: 'failed', message: 'Error in decoding the password-hash'});
          }
          if(res === true) {
            let userInfo = {
              username: user.local.username,
              email: user.local.email,
            };
            let token = jwt.sign(userInfo, process.env.JWT_SECRET);
            let message = 'Sucessfully signed in';
            return done(null, {status: 'success', message: message, user: userInfo, token: token});
          } else {
            return done(null, {status: 'failed', message: 'Password is incorrect'});
          }
        });
      }
    });
  }
));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "http://localhost:3000/auth/facebook/callback",
    profileFields: ['id', 'email', 'name']
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOne({'facebook.id': profile.id}, function(err, user) {
      if(err) {
        return done(err);
      }
      if(user){
        return done(null, user);
      } else {
        let newUser = new User();
        newUser.facebook.id = profile.id;
        newUser.facebook.token = token;
        newUser.facebook.name = profile.name;
        newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();
        newUser.save(function(err) {
          if(err) {
            throw err;
          } else {
            return done(null, newUser);
          }
        });
      }
    })
  }
));

// passport.use(new FacebookStrategy({
//   clientID: process.env.FACEBOOK_APP_ID,
//   clientSecret: process.env.FACEBOOK_APP_SECRET,
//   callbackURL: "http://localhost:3000/auth/facebook/callback",
//   profileFields: ['id', 'email', 'first_name', 'last_name']
// },
// function(token, refreshToken, profile, done) {
//   process.nextTick(function() {
//     User.findOne({'facebook.id': profile.id}, function(err, user) {
//       if(err) {
//         return done(err);
//       }
//       if(user){
//         return done(null, user);
//       } else {
//         let newUser = new User();
//         newUser.facebook.id = profile.id;
//         newUser.facebook.token = token;
//         newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
//         newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();
//         newUser.save(function(err) {
//           if(err) {
//             throw err;
//           } else {
//             return done(null, newUser);
//           }
//         });
//       }
//     })
//   });
// }
// ));

module.exports = passport;
