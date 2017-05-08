const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let userSchema = new Schema({
  local: {
    username: String,
    email: String,
    password: String,
    // todos: [{type: Schema.Types.ObjectId, ref: 'Todo'}]
  },
  facebook: {
    id: String,
    token: String,
    email: String,
    name: String,
    // todos: [{type: Schema.Types.ObjectId, ref: 'Todo'}]
  },
  todos: [{type: Schema.Types.ObjectId, ref: 'Todo'}]
});

let User = mongoose.model('User', userSchema);

module.exports = User;
