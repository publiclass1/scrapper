const exec = require('child_process').exec
const script = require.resolve(__dirname + '/../scripts/browser.js')
const cheerio = require('cheerio')
const fs = require('fs')
const AGENT_INDEX = process.env.AGENT_INDEX;

module.exports = (url) => {
  return new Promise((resolve, reject) => {
    let cmd = ' url="' + url + '" phantomjs ' + script
    
    if (AGENT_INDEX){
      cmd = 'AGENT_INDEX="'+ AGENT_INDEX +'" '+ cmd;
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
      //check if amazon response 503
      if ($('title').text().trim() === 'Sorry! Something went wrong!') {
        fs.exists(fileErrorPath, function (_exists) {
          if (_exists) return resolve($)

          fs.writeFile(fileErrorPath, '1', function (err) {
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