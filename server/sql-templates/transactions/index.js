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
      pending_rate: safe_div(x.pending, x.total)
    , delivered_rate: safe_div(x.delivered, x.total)
    , failed_rate: safe_div(x.failed, x.total)
  })
  
 const reduce_data = data => {
   return add_ratios(data.reduce(
      (acc, a) =>
        R.merge(acc, {
            pending: a.pending + acc.pending
          , delivered: a.delivered + acc.delivered
          , refunded: a.refunded + acc.refunded
          , failed: a.failed + acc.failed
          , unknown: a.unknown + acc.unknown
          , total: a.total + acc.total
        })
      , {pending: 0, delivered: 0, refunded: 0, failed: 0, unknown: 0, total: 0}
    ))
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
                  R.map(x => R.merge(x, { section_total_ratio: safe_div(x.total, reduced_section.total) }))
                , R.sortBy(x => is_date_param(params.row) ? new Date(x.row).valueOf() : x.row)
              )(data) 
            })
        })
        , R.sortBy(x => {
           return is_date_param(params.section) ? new Date(x.section).valueOf() : x.total * -1
        })
      ))
    , R.toPairs
    , R.map(([page, data]) => R.merge(reduce_data(data), {page, data}))
    , R.sortBy(x => is_date_param(params.page) ? new Date(x.page).valueOf() : x.total * -1)
  )
}