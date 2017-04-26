const R = require('ramda')

module.exports = (params) => R.pipe(
    R.groupBy(R.prop('sale_window_start'))
  , R.map(R.sortBy(R.prop('day_after_subscription')))
  , R.toPairs
  , R.map(([day, data]) => ({day: new Date(day), data: R.map(x => R.merge(x, {arpu: x.revenue / x.sale_count}))(data)}))
  , R.sortBy(x => x.day.valueOf())
)
