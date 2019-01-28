const axios  = require('axios').default;

const data = {
  url: 'https://api.ipify.org?format=json',
  schema: {
    content: 'body'
  }
};

(async ()=> {
  const rs = await axios.post('http://localhost:3333/crawler-v2',data);
  console.log(rs.data);
})();

// curl -x http://us-wa.proxymesh.com:31280 -U rmenguito:Proxymesh1! https://api.ipify.org?format=json