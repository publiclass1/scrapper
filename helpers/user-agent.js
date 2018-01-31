const fs = require('fs');

var agents = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.132 Safari/537.36',
  'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/12.246',
  'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:33.0) Gecko/20100101 Firefox/33.0',
  'Mozilla/5.0 (X11; Linux i586; rv:31.0) Gecko/20100101 Firefox/31.0',
  'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20130401 Firefox/31.0',
  'Mozilla/5.0 (Windows NT 5.1; rv:31.0) Gecko/20100101 Firefox/31.0',
  'Mozilla/5.0 (X11; Linux) KHTML/4.9.1 (like Gecko) Konqueror/4.9',
  'Mozilla/5.0 (X11; Linux 3.5.4-1-ARCH i686; es) KHTML/4.9.1 (like Gecko) Konqueror/4.9',
  'Opera/9.80 (X11; Linux i686; Ubuntu/14.10) Presto/2.12.388 Version/12.16',
  'Opera/9.80 (Windows NT 6.0) Presto/2.12.388 Version/12.14',
  'Mozilla/5.0 (Windows NT 6.0; rv:2.0) Gecko/20100101 Firefox/4.0 Opera 12.14',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/59.0.3071.109 Chrome/59.0.3071.109 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/604.3.5 (KHTML, like Gecko) Version/11.0.1 Safari/604.3.5'
];



function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const totalAgents = agents.length;
const fileName = __dirname + '/../.ug';

function saveAgentIndex(index, callback) {
  fs.writeFile(fileName, index, (err) => {
    if (err) return callback(err);
    callback(null);
  })
}
function getNewAgent(hasError, callback) {
  fs.exists(fileName, (exist) => {

    if (!exist) {
      const firstAgent = agents[0];
      return saveAgentIndex(0, (err) => {
        if (err) return callback(err);

        callback(null, firstAgent);
      });
    }

    fs.readFile(fileName, 'utf8', (err, data) => {
      if (err) {
        return callback(err);
      }
      if (!data) {
        return callback(new Error('No data.'));
      }

      let index = parseInt(data);
      let agent = null;
      console.log('default index', index, 'hasError', hasError);

      if (hasError) {
        // lets try another user agent.
        index += 1;
        if (index > totalAgents - 1) {
          index = randomIntFromInterval(0, totalAgents - 1);
        }
        agent = agents[index];
        return saveAgentIndex(index, (errSaveAgentIndex) => {
          if (errSaveAgentIndex) {
            console.error('Error on saving new index for agent', errSaveAgentIndex);
          } else {
            console.log('New agent indexed', index);
            callback(null, agent);
          }
        });
      }

      if (index > totalAgents - 1) {
        const randomIndex = randomIntFromInterval(0, totalAgents - 1);
        agent = agents[randomIndex];
        saveAgentIndex(randomIndex, (errSaveAgentIndex) => {
          if (errSaveAgentIndex) {
            console.error('Error on saving new index for agent', errSaveAgentIndex);
          } else {
            console.log('New agent indexed', index);
            callback(null, agent);
          }
        });
      } else {
        agent = agents[index];
        callback(null, agent);
      }

    })
  });
}


module.exports = getNewAgent;