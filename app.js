const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const index = require('./routes/index');
const crawler = require('./routes/crawler');
const crawler2 = require('./routes/crawler-v2');
const limiterMiddleware = require('./middlewares/crawler');
const sleepMiddleware = require('./middlewares/sleep-time');
const logCounter = require('./middlewares/logCounter');
const asyncMiddleware = require('./middlewares/asyncMiddleware');
const app = express();


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use('/', index);
app.use('/test', (req,res)=>{
  res.status(500).json({
    code: 'ab'
  })
});
app.use('/crawler-v1', sleepMiddleware, limiterMiddleware, crawler);
app.use('/crawler', limiterMiddleware, asyncMiddleware(logCounter),crawler2);

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
