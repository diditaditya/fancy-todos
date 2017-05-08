const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const passport = require('passport');
// const LocalStrategy = require('passport-local').Strategy;

require('dotenv').config();

const app = express();

const index = require('./routes/index');

mongoose.connect('mongodb://localhost/todo');

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    next();
})

app.use(passport.initialize());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/', index);

app.listen(3000);

console.log('listening to port 3000');
