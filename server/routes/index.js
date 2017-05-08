const express = require('express');
const router = express.Router();
const passport = require('../passport/passport');
const userControl = require('../controllers/user');
const todoControl = require('../controllers/todo');
const signupHelper = require('../helpers/signup');

router.get('/', (req, res) => {
  res.send('Up and running');
});

router.get('/users', userControl.showAll);

router.post('/localSignup', signupHelper, userControl.register);
router.post('/localSignin', passport.authenticate('local-signin', {session: false}), userControl.localSignin);
router.post('/facebookSignin', userControl.facebookLogin);

router.get('/dashboard/:login_method/:user', userControl.fetchUserData);

router.get('/todos', todoControl.showAll);
router.post('/todos', todoControl.add);
router.put('/todos/:id', todoControl.update);
router.delete('/todos/:id', todoControl.delete);

router.put('/user/:id', userControl.update);

// router.get('/auth/facebook', (req, res) => {
//   let url = 'https://www.facebook.com/v2.9/dialog/oauth?';
//   url += 'client_id='+process.env.FACEBOOK_APP_ID;
//   url += '&response_type='+'token';
//   url += '&scope='+'email';
//   url += '&redirect_uri='+'http://localhost:3000/auth/facebook/callback';
//   res.redirect(url);
// });
//
// router.get('/auth/facebook/callback', passport.authenticate('facebook', {session: false, failureRedirect: '/'}),
//   function(req, res) {
//     // console.log(req);
//     res.send(req);
//   }
// );

// https://www.facebook.com/v2.9/dialog/oauth?client_id=435613266793416&redirect_uri=http://localhost:3000/auth/facebook/callback

// This works, however it logs you in with my freakin fb account -.-
router.get('/auth/facebook', passport.authenticate('facebook', {session: false}));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {session: false, failureRedirect: 'http://localhost:8080/login.html'}),
  function(req, res) {
    console.log(req);
    res.send(req);
  }
);


module.exports = router;
