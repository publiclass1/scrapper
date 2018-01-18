const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const moment = require('moment');
const index = require('./routes/index');
const crawler = require('./routes/crawler');

const app = express();

let timeToAccept = new Date();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use('/', index);
app.use('/crawler', (req, res, next) => {

  const randomTime = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  const timeDiff = moment().diff(timeToAccept, 's');
  const _randomSecond = randomTime(2, 59);

  console.log('Time to make a request', (timeDiff), '>', _randomSecond, ((timeDiff) > _randomSecond));

  if ((timeDiff) > _randomSecond) {
    timeToAccept = new Date();
    return next();
  }

  res.status(429).send('Not time to request');
}, crawler);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({})
});

module.exports = app;
