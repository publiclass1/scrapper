const cheerio = require('cheerio')
const ec = require('../../helpers/extract-contents');
const assert = require('assert')

const html = `
<html>
<body>
<p id="1" data-name="world">hello world</p>
<p id="2">Abbot</p>
<ul>
<li data-rank="1" class='a'>
1
<div class='context'>
<p>
  <span class='name'>banana</span>
  <span class='price'>1.0</span>
  <span data-type='sponsored'>
    <h1>DOLE</h1>
  </span>
</p>
</div>
</li>
<li data-rank="2" class='a'>
2
<div class='b1'>
  <div class='b'>c1</div>
  <div class='b'>c2</div>
  <div class='b'>c3</div>
</div>

</li>
</ul>

<a id='#nextpage' href='http://lo.c'>nextpage</a>
</body>
</html>
`

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

  it('should show a list of data nested with list of items', function () {
    const $ = cheerio.load(html2)
    const rs = ec($, {
      title: 'h1',
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

  it('should return a object with selector as string', () => {
    const $ = cheerio.load(html)
    const rs = ec($, {
      name: '#1',
      lname: '#2'
    })

    assert.deepEqual(rs, {
      name: 'hello world',
      lname: 'Abbot'
    })
  })

  it('should return a object using nested selector', () => {
    const $ = cheerio.load(html)
    const rs = ec($, {
      name: {
        selector: "#1",
        how: "text"
      },
      world: {
        selector: "#1",
        how: "attr",
        params: ['data-name']
      },
      rs: {
        listItems: {
          selector: 'ul li.a',
          data: {
            rank: {
              how: 'attr',
              params: ['data-rank']
            },
            content: {
              listItems: {
                selector: 'div.b',
                data: {
                  name: 'div.b'
                }
              }
            }
          }
        }
      },
    })

    assert.deepEqual(rs, {
      name: 'hello world',
      world: 'world',
      rs: [
        {
          rank: "1",
          content: []
        },
        {
          rank: "2",
          content: [
            { name: 'c1' },
            { name: 'c2' },
            { name: 'c3' },
          ]
        }
      ]
    })
  })
})