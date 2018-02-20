const R = require('ramda')

module.exports = (params) => {
  const is_date_param = param_value => ['hour', 'day', 'week', 'month'].some(p => p == param_value)
  
  const id = x => x
  const format = R.pipe(
      is_date_param(params.row) ? x => R.merge(x, {row: new Date(x.row).toISOString()}) : id
    , is_date_param(params.section) ? x => R.merge(x, {section: new Date(x.section).toISOString()}) : id
    , is_date_param(params.page) ? x => R.merge(x, {page: new Date(x.page).toISOString()}) : id
  )

  return R.pipe(
      R.map(format)
    // R.map( x => console.log(x))
    , R.groupBy(p => p.page)
    , R.map(R.pipe(
          R.groupBy(s => s.section)
        , R.toPairs
        , R.sortBy(x => {
          return is_date_param(params.section) ? new Date(x.section).valueOf() : x.total * -1
        }),
      ))
    , R.toPairs
    , R.sortBy(x => is_date_param(params.page) ? new Date(x.page).valueOf() : x.total * -1)
  )
}
