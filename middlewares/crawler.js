const moment = require('moment');
let timeToAccept = new Date();

const MIN_TIME_SLEEP = 2;
const MAX_TIME_SLEEP = 35;
module.exports = (req, res, next) => {

  const randomTime = function (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  const timeDiff = moment().diff(timeToAccept, 's');
  const _randomSecond = randomTime(MIN_TIME_SLEEP, MAX_TIME_SLEEP);

  console.log('Time to make a request', (timeDiff), '>', _randomSecond, ((timeDiff) > _randomSecond));

  if ((timeDiff) > _randomSecond) {
    timeToAccept = new Date();
    return next();
  }

  res.status(429).send('Not time to request');
};