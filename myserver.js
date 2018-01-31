var express = require('express');

const app = express();

app.get('/sample', (req, res) => {
  console.log('req.headers', req.headers)
  res.json({})
})
app.listen(3333, () => {
  console.log('port', 3333)
});