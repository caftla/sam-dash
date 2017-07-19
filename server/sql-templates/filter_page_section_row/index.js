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
    , pixels_cr: safe_div(x.pixels, x.views)
    , pixels_ratio: safe_div(x.pixels, x.sales)
    , cq: safe_div(x.firstbillings, x.sales)
    , cost: x.cost || ((x.paid_sales || 0) * (x.home_cpa || 0))
    , ecpa: safe_div(x.cost || ((x.paid_sales || 0) * (x.home_cpa || 0)), x.sales)
    , cpa: safe_div(x.cost || ((x.paid_sales || 0) * (x.home_cpa || 0)), (x.paid_sales || 0))
    , active24: safe_div(x.sales - x.optout_24, x.sales)
    , active: safe_div(x.sales - x.optouts, x.sales)
    , resubrate: safe_div(x.sales - x.uniquesales, x.sales)
  })
  
 const reduce_data = data => {
   const xdata = add_ratios(data.reduce(
      (acc, a) =>
        R.merge(acc, {
            views: acc.views + a.views
          , leads: acc.leads + a.leads
          , sales: acc.sales + a.sales
          , uniquesales: acc.uniquesales + a.uniquesales
          , paid_sales: acc.paid_sales + a.paid_sales
          , pixels: acc.pixels + (+a.pixels)
          , firstbillings: acc.firstbillings + a.firstbillings
          , cost: acc.cost + a.cost
          , optout_24: acc.optout_24 + a.optout_24
          , optouts: acc.optouts + a.optouts
          , day_optouts: acc.day_optouts + a.day_optouts
        })
      , {sales: 0, uniquesales: 0, paid_sales: 0, views: 0, leads: 0, pixels: 0, firstbillings: 0, cost: 0, optouts: 0, day_optouts: 0, optout_24: 0}
    ))

    const home_cpa =  safe_div(R.pipe(R.map(x => x.home_cpa * x.paid_sales), R.sum)(data), R.pipe(R.map(x => x.paid_sales), R.sum)(data))
    return R.merge(xdata, {
        home_cpa: home_cpa
    })
  }
  
  return R.pipe(
      R.map(format)
    , R.map(add_ratios)
    , R.groupBy(p => p.page)  
    , R.map(R.pipe(
          R.groupBy(s => s.section)
        , R.toPairs
        , R.map(([section, data]) => {
            const reduced_section = reduce_data(data)
            return R.merge(reduced_section, {
                section
              , page: data[0].page
              , data: R.pipe(
                  R.map(x => R.merge(x, { section_sales_ratio: safe_div(x.sales, reduced_section.sales) }))
                , R.sortBy(x => is_date_param(params.row) ? new Date(x.row).valueOf() : x.row)
              )(data) 
            })
        })
        , R.sortBy(x => {
           return is_date_param(params.section) ? new Date(x.section).valueOf() : x.sales * -1
        })
      ))
    , R.toPairs
    , R.map(([page, data]) => R.merge(reduce_data(data), {page, data}))
    , R.sortBy(x => is_date_param(params.page) ? new Date(x.page).valueOf() : x.sales * -1)
  )
}