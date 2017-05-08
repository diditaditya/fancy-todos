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

// This works, however the cors thingy does not work when this is called from client side
router.get('/auth/facebook', passport.authenticate('facebook', {session: false}));
router.get('/auth/facebook/callback', passport.authenticate('facebook', {session: false, failureRedirect: 'http://localhost:8080/login.html'}),
  function(req, res) {
    console.log(req);
    res.send(req);
  }
);


module.exports = router;
