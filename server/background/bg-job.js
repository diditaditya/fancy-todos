const CronJob = require('cron').CronJob;
const Kue = require('kue');
const queue = Kue.createQueue();
const User = require('../models/user');
const Todo = require('../models/todo');

let setCronJob = function(user, todo) {

  let name = '';
  if(user.local) {
    name = user.local.username;
  } else {
    name = user.facebook.name;
  }

  let title = todo.title;
  let dueDate = new Date(todo.dueDate);

  let month = dueDate.getMonth();
  let date = dueDate.getDate();
  let hour = dueDate.getHours();
  let minute = dueDate.getMinutes();

  let setTime = `0 ${minute} ${hour} ${date} ${month} *`;

  let cronJob = new CronJob(setTime, function() {
    console.log('Cron is up and running');

    let job = queue.create('notif', {
      name: name,
      todo: title
    }).save((err) => {
      if(!err) {
        console.log(`Job queue ${job.id} has been saved to redis`);
      }
    });

    job.on('complete', function() {
      console.log(`Job queue ${job.id} is done`);
    }).on('failed', function() {
      console.log(`Job queue ${job.id} has failed`);
    })

    queue.process('notif', function(job, done) {
      console.log(`${job.data.name}, ${job.data.todo} has met the deadline at ${dueDate}`);
      done();
    });

  }, null, true, 'Asia/Jakarta');
}

module.exports = setCronJob;
