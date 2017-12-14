const scraper = require('../../helpers/scraper');

const url = 'https://www.amazon.com/s/?field-keywords=beanie+for+men';
scraper(url)
  .then($ => {
    console.log($('title').text());
  });
