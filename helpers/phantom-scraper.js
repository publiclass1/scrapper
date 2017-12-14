const exec = require('child_process').exec
const script = require.resolve(__dirname + '/../scripts/browser.js')
const cheerio = require('cheerio')


module.exports = (url) => {
  return new Promise((resolve, reject) => {
    const cmd = 'url="' + url + '" phantomjs ' + script
    console.log('cmd', cmd)
    exec(cmd, {
      maxBuffer: 1024 * 1024 * 10
    }, function (err, stdout, stderr) {

      if (err) {
        console.log('phantom', err)
        return reject(err)
      }
      const $ = cheerio.load(stdout)
      resolve($)
    })
  })
}