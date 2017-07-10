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
      cr: safe_div(x.sales, x.views)
    , pixels_ratio: safe_div(x.pixels, x.sales)
    , cq: safe_div(x.firstbillings, x.sales)
    , cost: x.cost || ((x.paid_sales || 0) * (x.home_cpa || 0))
    , ecpa: safe_div(x.cost || ((x.paid_sales || 0) * (x.home_cpa || 0)), x.sales)
    , active24: safe_div(x.sales - x.optout_24, x.sales)
  })

  
  return R.pipe(
      R.map(format)
    , R.map(x => {
        if(!x.sales)
          x.sales = 0
        if(!x.views)
          x.views = 0
        return x
     })
    , R.map(add_ratios)
  )
}