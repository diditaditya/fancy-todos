const Todo = require('../models/todo');
const User = require('../models/user');
const CronJob = require('../background/bg-job')

let todoControl = {
  showAll: (req, res) => {
    Todo.find({}).populate('_creator').exec((err, data) => {
      if (err) {
        res.send(err);
      } else {
        res.send(data);
      }
    });
  },
  add: (req, res, next) => {
    let creator = req.body.userId;
    let title = req.body.title;
    let content = req.body.content;
    let dueDate;
    if(req.body.dueDate) {
      dueDate = new Date(req.body.dueDate);
    } else {
      dueDate = null;
    }

    let tags = req.body.tags || [];
    if (title) {
      let todo = new Todo({
        _creator: creator,
        title: title,
        content: content,
        createdDate: new Date(),
        dueDate: dueDate,
        completedDate: null,
        isCompleted: false,
        isDeleted: false,
        tags: tags
      });
      todo.save((err) => {
        if (err) {
          res.send(err);
        } else {
          User.findById(creator, (err, user) => {
            if(err) {
              res.send(err);
            } else {
              CronJob(user, todo);
              res.send(todo);
            }
          });                  }
      });
    } else {
      let message = 'Title must not be empty'
      res.send({message: message});
    }
  },
  showOne: (req, res) => {
    Todo.findById(req.params.id).populate('_creator').exec((err, data) => {
      if (err) {
        res.send(err);
      } else {
        res.send(data);
      }
    });
  },
  update: (req, res) => {
    Todo.findById(req.params.id, (err, todo) => {
      if (err) {
        res.send(err);
      } else {

        let creator = req.body.creator || todo._creator;
        let title = req.body.title || todo.title;
        let content = req.body.content || todo.content;
        let createdDate = new Date(req.body.createdDate) || todo.createdDate;
        let dueDate;
        if(req.body.dueDate === null) {
          dueDate = null;
        } else {
          dueDate = new Date(req.body.dueDate);
        }
        let completedDate;
        if(req.body.completedDate === null) {
          completedDate = null;
        } else {
          completedDate = new Date(req.body.completedDate);
        }
        let isCompleted = req.body.isCompleted || todo.isCompleted;
        let isDeleted = req.body.isDeleted || todo.isDeleted;
        let tags = req.body.tags || todo.tags;

        Todo.update({_id: req.params.id}, {$set:{
          _creator: creator,
          title: title,
          content: content,
          createdDate: createdDate,
          dueDate: dueDate,
          completedDate: completedDate,
          isCompleted: isCompleted,
          isDeleted: isDeleted,
          tags: tags
        }}, (err, updated) => {
          if (err) {
            res.send(err);
          } else {
            res.send(updated);
          }
        });
      }
    });
  },
  delete: (req, res) => {
    Todo.findByIdAndRemove(req.params.id, (err, deleted) => {
      if(err) {
        res.send(err);
      } else {
        res.send(deleted);
      }
    });
  }
};

module.exports = todoControl;
