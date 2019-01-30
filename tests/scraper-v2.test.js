const axios  = require('axios').default;
URL="https://api.ipify.org?format=json" /usr/local/Cellar/node/10.11.0/bin/node /Users/ralphmenguito/Development/JamesWork/james-online-scraper/scripts/run-chrome-browser.js
const data = {
  url: 'https://api.ipify.org?format=json',
  schema: {
    content: 'body'
  }
};

(async ()=> {
  const rs = await axios.post('http://localhost:3333/crawler',data);
  console.log(rs.data);
})();

// curl -x http://us-wa.proxymesh.com:31280 -U rmenguito:Proxymesh1! https://api.ipify.org?format=json