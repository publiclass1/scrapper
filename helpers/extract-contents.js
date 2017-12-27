const _ = require('lodash')
const $ = require('cheerio')

function getWithSelectorOptions($el, schema) {

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
  const getVal = (el, how, params) => {
    if (!_.isUndefined(el[how])) {
      return el[how](...params)
    }
    return null
  }

  //for single inner element on single selector object
  let innerElement = $el
  if (selector) {
    innerElement = _.isFunction($el)
      ? $el(selector)
      : $(selector, $el)
  }

  return getVal(innerElement, how, params)
}

function recursiveSelectValue($el, schema, _return = {}) {

  for (let key in schema) {
    const val = schema[key]

    //pagination
    if (_.has(val, 'listItems')) {
      const _listItems = [];
      let listItems = [];
      let listItemsSelector = val.listItems.selector;

      if (!_.isArray(val.listItems.selector)) {
        listItemsSelector = [val.listItems.selector];
      }
      listItemsSelector.forEach(_lis => {
        const listOfItems = _.isFunction($el) ? $el(_lis) : $(_lis, $el);
        if (listOfItems.length > 0) {
          listItems = listOfItems;
          return false
        }
      })


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

    if (_.isArray(val)) {
      let _val = null
      for (let _idx in val) {
        const subSchema = val[_idx]
        _val = getWithSelectorOptions($el, subSchema)
        if (_val) {
          break;
        }
      }
      _return[key] = _val
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