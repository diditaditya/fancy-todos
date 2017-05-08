const User = require('../models/user');
const axios = require('axios');

let userControl = {
  showAll: function(req, res) {
    User.find({}).populate('todos').exec((err, users) => {
      if(err) {
        res.send(err);
      } else {
        res.send(users);
      }
    });
  },
  fetchUserData: function(req, res) {
    let method = req.params.login_method;
    if (method === "local") {
      User.findOne({'local.username': req.params.user}).populate('todos').exec((err, user) => {
        if (err) {
          res.send(err);
        } else {
          res.send(user);
        }
      });
    } else if (method === "facebook") {
      User.findOne({'facebook.id': req.params.user}).populate('todos').exec((err, user) => {
        if (err) {
          res.send(err);
        } else {
          res.send(user);
        }
      });
    }
  },
  test: (req, res) => {
    console.log('here in the user.test');
    console.log(req);
    res.send(req.todoId);
  },
  appendUserTodos: (req, res) => {
    console.log(req);
    let userId = req.params.id;
    console.log('userId: ', userId);
    User.findById(userId, (err, user) => {
      console.log('user is found');
      if (err) {
        res.send(err);
      } else {
        let todos = user.todos.push(req.body.todo._id);
        if(user.local) {
          console.log('user is local, and the id is '+userId);
          User.update({_id: userId}, {$set:{
            'local.username': user.local.username,
            'local.email': user.local.email,
            'local.password': user.local.password,
            todos: todos
          }}, (err, updated) => {
            if (err) {
              console.log('goes to error in local user update');
              res.send(err);
            } else {
              console.log('local user is updated');
              res.send(updated);
            }
          });
        } else if(user.facebook) {
          User.update({_id: userId}, {$set:{
            'facebook.name': user.facebook.name,
            'facebook.email': user.facebook.email,
            'facebook.id': user.facebook.id,
            'facebook.token': user.facebook.token,
            todos: todos
          }}, (err, updated) => {
            if (err) {
              res.send(err);
            } else {
              res.send(updated);
            }
          });
        }
      }
    });
  },
  update: function(req, res) {
    User.findById(req.params.id, (err, user) => {
      if (err) {
        res.send(err);
      } else {
        let todos = req.body.todos;
        if(user.local) {
          User.update({_id: req.params.id}, {$set:{
            'local.username': req.body.name || user.local.username,
            'local.email': req.body.email || user.local.email,
            'local.password': user.local.password,
            todos: todos
          }}, (err, updated) => {
            if (err) {
              console.log('goes to error in local user update');
              res.send(err);
            } else {
              console.log('local user is updated');
              res.send(updated);
            }
          });
        } else if(user.facebook) {
          User.update({_id: req.params.id}, {$set:{
            'facebook.name': user.facebook.name,
            'facebook.email': user.facebook.email,
            'facebook.id': user.facebook.id,
            'facebook.token': user.facebook.token,
            todos: todos
          }}, (err, updated) => {
            if (err) {
              res.send(err);
            } else {
              res.send(updated);
            }
          });
        }
      }
    });
  },
  register: function(req, res) {
    if(req.message) {
      console.log(req.message);
    } else {
      res.send('User has been succesfully registered');
    }
  },
  localSignin: function(req, res) {
    console.log('status: ', req.user.status);
    console.log('message: ', req.user.message);
    if(req.user.status === "failed") {
      res.send({status: req.user.status, message: req.user.message});
    }
    if(req.user.status === "success"){
      res.send(req.user)
    } else {
      res.send('error');
    }
  },
  facebookLogin: function(req, res) {
    let id = req.body.id;
    let name = req.body.name;
    let email = req.body.email;
    User.findOne({'facebook.id': id}, function(err, user) {
      if(err) {
        res.send(err);
      }
      if(user) {
        res.send(user);
      } else {
        let newUser = new User({
          id: id,
          name: name,
          email: email,
          todos: []
        });
        newUser.save(function(err) {
          if(err) {
            res.send(err);
          } else {
            res.send(newUser);
          }
        });
      }
    });
  }
}

module.exports = userControl;
