const fs = require('fs');
const path = require('path');
const moment = require('moment');

const errFilename = path.resolve(__dirname + '/../amz.err');
const HOUR_TO_SLEEP = 3;
let sleepTime = null;

module.exports = (req, res, next) => {

  console.log('Check file error exist');
  fs.exists(errFilename, (exist) => {
    console.log('Error exist?', exist);

    if (exist) {
      console.log('sleepTime is null', sleepTime);

      if (!sleepTime) {
        sleepTime = moment().add(HOUR_TO_SLEEP, 'hour').toDate();

        console.log('Sleep time ', sleepTime);
      } else {
        console.log('Time to wake up?', moment(), sleepTime, moment().isAfter(moment(sleepTime)));
        if (moment().isAfter(moment(sleepTime))) {
          console.log('Sleep time is over.')
          sleepTime = null;
          return next();
        }
      }

      console.log('Response not ready');
      res.status(429).send('Not time to request');
    } else {
      next();
    }
  });
};