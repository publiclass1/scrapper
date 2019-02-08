
const fs = require('fs');
const moment = require('moment');
const path = require('path');

async function countRequest() {
  return new Promise(resolve => {
    const currentDate = moment().format('YMMDD');
    const location = path.resolve(__dirname, '..', `request.log`);
    if (fs.existsSync(location)) {
      try {
        const content = fs.readFileSync(location, 'utf8');
        const data = JSON.parse(content);
        data[currentDate] = data[currentDate]?(data[currentDate]+1): 1;
        fs.writeFileSync(location, JSON.stringify(data));
      } catch (e) { }
      resolve();
    } else {
      const data = {};
      data[currentDate] = 1;
      fs.writeFileSync(location, JSON.stringify(data));
      resolve();
    }
  });
}

module.exports = async function(req,res,next){
  await countRequest();
  next();
}