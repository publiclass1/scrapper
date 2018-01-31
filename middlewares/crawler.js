const moment = require('moment');
let timeToAccept = new Date();

module.exports = (req, res, next) => {

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
};