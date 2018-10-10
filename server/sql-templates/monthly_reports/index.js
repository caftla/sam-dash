// @flow

const R = require('ramda')


const transform = params => data =>  {
  const date_keys = R.pipe(
      R.map(x => ({year_code: x.year_code, month_code: x.month_code}))
    , R.uniq
    , R.sortBy(x => x.year_code * 12 + x.month_code)
  )(data)

  const calcStats = R.reduce(({sales, cost, revenue}, a) => ({
    sales: sales + a.sales || 0,
    cost: cost + a.cost || 0,
    revenue: revenue + a.revenue || 0
  }), {sales: 0, cost: 0, revenue: 0})
      
  return R.pipe(
      R.groupBy(x => `${x.page}-${x.section}-${x.year_code}-${x.month_code}`)
    , R.map(R.reduce(R.merge, {}))
    , R.values
    , R.groupBy(x => x.page)
    , R.toPairs
    , R.chain(([page, gdata]) => {
        return R.pipe(
            R.groupBy(x => `${x.section}`)
          , R.toPairs
          , R.map(([section, data]) => ({section, data}))
          , xs => {
              return R.pipe(
                R.map(({section, data}) => ({
                    page
                  , section
                  , data: date_keys.map(({year_code, month_code}) => R.merge({year_code, month_code, page, section},
                      data.find(x => x.year_code == year_code && x.month_code == month_code)
                    ))
                }))
              )(xs)
            }
        )(gdata)
    })
  , R.chain(x => x.data)
  , R.groupBy(x => x.page)
  , R.toPairs
  , R.map(([page, data]) => ({
    page,
      data: R.pipe(
          R.groupBy(x => x.section)
        , R.toPairs
        , R.map(([section, data]) => R.merge(calcStats(data), {
            page, section, data
        }))
      )(data)
  }))
, R.map(p => R.merge(calcStats(p.data), p))
  )(data)
}
module.exports = transform
