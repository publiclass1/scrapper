const exec = require('child_process').exec
const script = require.resolve(__dirname + '/../scripts/browser.js')
const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

const USER_AGENT = process.env.USER_AGENT;

module.exports = (url, myUserAgent, setting) => {
  // console.log('SEtting', setting);
  return new Promise((resolve, reject) => {
    let cmd = ' url="' + url
      + '" phantomjs ' + script;

    if (USER_AGENT || myUserAgent) {
      cmd = ' USER_AGENT="' + (USER_AGENT || myUserAgent) + '" ' + cmd;
    }

    if(setting){
      cmd = ` setting="${setting}" ${cmd}`;
    }

    console.log('cmd', cmd)
    exec(cmd, {
      maxBuffer: 1024 * 1024 * 10
    }, function (err, stdout, stderr) {

      if (err) {
        console.log('phantom', err)
        return reject(err)
      }
      const $ = cheerio.load(stdout)
      const fileErrorPath = __dirname + '/../amz.err'

      const title = $('title').text().trim();

      console.log('\n\nTitle>', title);
      //check if amazon response 503
      if (title === 'Sorry! Something went wrong!' ||
        title === 'Robot Check') {
        fs.exists(fileErrorPath, function (_exists) {
          if (_exists) return resolve($)

          fs.writeFile(fileErrorPath, stdout, function (err) {
            resolve($)
          })
        });

      } else {
        fs.exists(fileErrorPath, function (_exists) {
          if (!_exists) return resolve($)

          fs.unlink(fileErrorPath, function () {
            resolve($)
          })
        })
      }

    })
  })
}