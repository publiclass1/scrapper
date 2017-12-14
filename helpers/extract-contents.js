const _ = require('lodash')
const $ = require('cheerio')

function getWithSelectorOptions($el, schema, _return) {

  let val = null

  if (_.isString(schema)) {
    val = _.isFunction($el) ? $el(schema).text() : $el.text()
    return val
  }

  const { selector, how = 'text', params = [] } = schema

  // console.log('<<',
  //   '\nselector', selector,
  //   '\nhow', how,
  //   '\nhtml', $el.html(),
  //   '\nvalue:', $(selector, $el)[how](...params))
  let innerElement = $el
  if (selector) {
    innerElement = _.isFunction($el)
      ? $el(selector)
      : $(selector, $el)
  }

  if (!_.isUndefined(innerElement[how])) {
    val = innerElement[how](...params)
  }
  return val
}

function recursiveSelectValue($el, schema, _return = {}) {

  for (let key in schema) {
    const val = schema[key]
    //pagination
    if (_.has(val, 'listItems')) {
      const _listItems = []
      const listItemsSelector = _.isString(val.listItems) ? val.listItems : val.listItems.selector
      const listItems = _.isFunction($el) ? $el(listItemsSelector) : $(listItemsSelector, $el)
      const listItemSchema = val.listItems.data

      if (listItems.length > 0) {

        listItems.each(function (idx, el) {
          let item = {}
          recursiveSelectValue($(el), listItemSchema, item)
          _listItems.push(item)
        })
      }
      _return[key] = _listItems
      continue
    }

    if (_.isPlainObject(val)
      && !_.has(val, 'selector')
      && !_.has(val, 'how')
      && !_.has(val, 'params')
    ) {
      _return[key] = {}
      recursiveSelectValue($($el), val, _return[key])
      continue
    }
    _return[key] = getWithSelectorOptions($el, val)
  }

  return _return
}

module.exports = ($el, schema) => {
  let _return = {}
  recursiveSelectValue($el, schema, _return)
  return _return
}