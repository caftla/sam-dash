const R = require('ramda')

module.exports = (params) => {
  const is_date_param = param_value => ['hour', 'day', 'week', 'month'].some(p => p == param_value)
  
  const id = x => x
  const format = R.pipe(
      is_date_param(params.row) ? x => R.merge(x, {row: new Date(x.row).toISOString()}) : id
    , is_date_param(params.section) ? x => R.merge(x, {section: new Date(x.section).toISOString()}) : id
    , is_date_param(params.page) ? x => R.merge(x, {page: new Date(x.page).toISOString()}) : id
  )

  const safe_div = (x, y) => y == 0 && x == 0 ? 0
    : y == 0 ? Infinity
    : x / y
    
    
  const add_ratios = x => R.merge(x, {

  })

  
  return R.pipe(
      R.map(format)
    , R.map(x => {
        const breakdown = R.fromPairs([
            [params.page, x.page]
          , [params.section, x.section]
          , [params.row, x.row]
        ])

        delete x.page
        delete x.section
        delete x.row
        return R.merge(breakdown, x)
     })
    , R.map(add_ratios)
  )
}