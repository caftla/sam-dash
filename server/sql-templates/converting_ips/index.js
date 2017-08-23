const R = require('ramda')

module.exports = (params) =>  data => {

  const safe_div = (x, y) => y == 0 && x == 0 ? 0
    : y == 0 ? Infinity
    : x / y

  const all_operators = R.pipe(
      R.groupBy(x => x.operator_code || 'Unknown')
    , R.keys
    , R.sortBy(x => x)
  )(data)

  const summerize = data => {
      
    const summary = data.reduce((acc, a) => ({
        views: acc.views + a.views
      , sales: acc.sales + a.sales
      , pixels: acc.pixels + a.pixels
      , firstbillings: acc.firstbillings + a.firstbillings
      , cost: acc.cost + a.cost
    }), { views: 0, sales: 0, pixels: 0, firstbillings: 0, cost: 0 })
    
    return summary
  }

  const summerize_ip3  = data => data.reduce((acc, a) => ({
      views: acc.views > 0 ? acc.views : a.views
    , sales: acc.sales + a.sales
    , pixels: acc.pixels + a.pixels
    , firstbillings: acc.firstbillings + a.firstbillings
    , cost: acc.cost + a.cost
  }), { views: 0, sales: 0, pixels: 0, firstbillings: 0, cost: 0 })

  const add_ratios = x => R.merge(x, {
      cr: safe_div(x.sales, x.views)
    , pixels_cr: safe_div(x.pixels, x.views)
    , pixels_ratio: safe_div(x.pixels, x.sales)
    , cq: safe_div(x.firstbillings, x.sales)
    , ecpa: safe_div(x.cost, x.sales)
    , cpa: safe_div(x.cost, x.pixels)
  })

  const merge_ip3s = (last, a = {views: 0, sales: 0, pixels: 0, firstbillings: 0, cost: 0, operators: []}) => ({
      views: last.views + a.views
    , sales: last.sales + a.sales
    , pixels: last.pixels + a.pixels
    , firstbillings: last.firstbillings + a.firstbillings
    , cost: last.cost + a.cost
    , ip3From: last.ip3
    , ip3: last.ip3
    , ip3To: a.ip3 || last.ip3
    , _ip3: last._ip3
    , operators: R.pipe(
        R.groupBy(x => x.operator_code)
      , R.toPairs
      , R.map(([operator_code, data]) => {
          return add_ratios(R.merge(R.reduce((acc, a) => 
              ({sales: acc.sales + a.sales, pixels: acc.pixels + a.pixels, firstbillings: acc.firstbillings + a.firstbillings, cost: acc.cost + a.cost})
            , {sales: 0, pixels: 0, firstbillings: 0, cost: 0}
            )(data), {operator_code}))
        })
      , operators => all_operators.map(p => operators.find(o => o.operator_code == p) || { operator_code: p, sales: 0, pixels: 0, firstbillings: 0, cost: 0 })
      )(last.operators.concat(a.operators))
  })

  return R.pipe(
    R.reject(x => !x.ip3)
  // , R.filter(x => x.ip3.startsWith( '37.236'))
    
  , R.map(x => R.merge(x, {
        ip1: x.ip3.split('.')[0]
      , ip2: R.pipe(R.take(2), R.join('.'))(x.ip3.split('.'))
      , operator_code: !x.operator_code ? 'Unknown' : x.operator_code
    }))
  , R.groupBy(x => x.ip1)
  , R.map(R.pipe( // ip1
        R.groupBy(x => x.ip2)
      , R.map(R.pipe(//ip2
            R.groupBy(x => x.ip3)
          , R.toPairs, R.map(([ip3, operators]) => R.merge(summerize_ip3(operators), {
                ip3
              , _ip3: parseInt(ip3.split('.')[2])
              , operators: operators.map(d => ({operator_code: d.operator_code, sales: d.sales, pixels: d.pixels, firstbillings: d.firstbillings, cost: d.cost}))
            }))
          // group nearby ips
          , R.sortBy(x => x._ip3)
          , R.reduce(
                ({acc, _lastip3}, a) => ({
                    acc: acc.length == 0 
                    ? [merge_ip3s(a)] 
                    : (a._ip3 - _lastip3) > params.resolution
                      ? acc.concat([merge_ip3s(a)])
                      : R.init(acc).concat([merge_ip3s(R.last(acc), a)])
                  , _lastip3: a._ip3})
              , {acc: [], _lastip3: 0}
            )
          , x => x.acc
          , R.sortBy(x => x.sales * -1)
        ))
      , R.toPairs, R.map(([ip2, data]) => R.merge(summerize(data), {ip2, data}))
      , R.sortBy(x => x.sales * -1)
    ))
  , R.toPairs, R.map(([ip1, data]) => R.merge(summerize(data), {ip1, data}))
  , R.sortBy(x => x.sales  * -1)

  , R.chain(x => R.chain(y => y.data)(x.data))
  , R.map(add_ratios)
  )(data)

}