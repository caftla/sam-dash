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
      // group the result into page, seciton, row format (nested)
    , R.pipe(
          R.groupBy(x => x.page)  
        , R.map(R.pipe(
            R.groupBy(y => y.section)
          , R.toPairs
          , R.map(([_, data]) => ({page: data[0].page, section: data[0].section, data}))
        ))
        , R.toPairs
        , R.map(([_, data]) => ({page: data[0].page, data}))
      )
  )