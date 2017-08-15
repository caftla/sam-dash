const R = require('ramda')

module.exports = (params) => R.pipe(
    R.map(d => 
      R.merge(d, {
        sale_count: d.data[0].sale_count,
        ecpa: d.data[0].cost / d.data[0].sale_count,
        data: R.pipe(
          R.map(x => R.merge(x, {arpu: x.revenue / x.sale_count}))
        , R.sortBy(x => x.day_after_subscription)
        )(d.data)})
    )
  )