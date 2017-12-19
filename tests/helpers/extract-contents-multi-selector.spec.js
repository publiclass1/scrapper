const cheerio = require('cheerio')
const ec = require('../../helpers/extract-contents');
const assert = require('assert')

const html2 = `
  <html>
    <body>
      <h1>title</h1>
      <p>Description</p>
      <ul>
        <li data-rank='0'>
          <h5 data-pxl='1'>Hat</h5>
          <span class='price'>1.0</span>
        </li>
        <li data-rank='1'>
          <h5 data-pxl='2'>Beanie Hat</h5>
          <span class='price'>4.0</span>
        </li>
      </ul>
    </body>
  </html>
`
describe('Extract Contents on html from cheerio object', () => {

  it('should show a list of data nested with list of items from multi selector', function () {
    const $ = cheerio.load(html2)
    const rs = ec($, {
      title: [{ selector: '#h1' }, { selector: 'h1' }],
      description: 'p',
      results: {
        listItems: {
          selector: 'ul li[data-rank]',
          data: {
            rank: { how: 'attr', params: ['data-rank'] },
            name: { selector: 'h5' },
            pxl: { selector: 'h5[data-pxl]', how: 'attr', params: ['data-pxl'] },
            price: { selector: 'span.price' }
          }
        }
      }
    })
    assert.deepEqual(rs, {
      title: 'title',
      description: 'Description',
      results: [
        {
          rank: '0',
          name: 'Hat',
          pxl: '1',
          price: '1.0'
        },
        {
          rank: '1',
          name: 'Beanie Hat',
          pxl: '2',
          price: '4.0'
        }
      ]
    })
  })


})