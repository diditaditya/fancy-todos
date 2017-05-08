const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let todoSchema = new Schema({
  _creator: { type: Schema.Types.ObjectId, ref: 'User'},
  title: String,
  content: String,
  createdDate: Date,
  dueDate: Date,
  completedDate: Date,
  isCompleted: Boolean,
  isDeleted: Boolean,
  tags: [{type: String}]
});

let Todo = mongoose.model('Todo', todoSchema);

module.exports = Todo;
