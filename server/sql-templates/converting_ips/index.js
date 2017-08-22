const R = require('ramda')

module.exports = (params) =>  data => {
  
  const safe_div = (x, y) => y == 0 && x == 0 ? 0
    : y == 0 ? Infinity
    : x / y
    
    
  const add_ratios = x => R.merge(x, {
      cr: safe_div(x.sales, x.views)
    , pixels_cr: safe_div(x.pixels, x.views)
    , pixels_ratio: safe_div(x.pixels, x.sales)
    , cq: safe_div(x.firstbillings, x.sales)
    , ecpa: safe_div(x.cost, x.sales)
    , cpa: safe_div(x.cost, x.pixels)
  })
  
 const reduce_data = data => {
   return add_ratios(data.reduce(
      (acc, a) =>
        R.merge(acc, {
            views: acc.views + a.views
          , leads: acc.leads + a.leads
          , sales: acc.sales + a.sales
          , pixels: acc.pixels + (+a.pixels)
          , firstbillings: acc.firstbillings + a.firstbillings
          , cost: acc.cost + a.cost
        })
      , {sales: 0, views: 0, pixels: 0, firstbillings: 0, cost: 0}
    ))
  }
  
  return R.pipe(
      R.reject(x => !x.row)
    , R.groupBy(x => x.page)
    , R.map(R.pipe(
        R.groupBy(x => x.section)
      
      , R.map(
        R.pipe(
            R.map(R.applySpec({
                ips: x => x.row.split('.').map(x => parseInt(x))
              , sales: x => x.sales
              , firstbillings: x => x.firstbillings
              , views: x => x.views
              , cost: x => x.cost
              , pixels: x => x.pixels
            }))
          , R.groupBy(x => x.ips[0])
          , R.map(R.groupBy(x => x.ips[1]))
          , R.map(R.map(R.pipe(
              R.map(R.applySpec({
                  ip3: x => x.ips[2]
                , sales: x => x.sales
                , firstbillings: x => x.firstbillings
                , views: x => x.views
                , cost: x => x.cost
                , pixels: x => x.pixels
              }))
            , R.sortBy(x => x.ip3)
            , R.reduce(
                (acc, a) => { if(acc.length == 0) {
                    return acc.concat([{
                        from: a.ip3, to: a.ip3
                      , sales: a.sales, views: a.views, firstbillings: a.firstbillings, cost: a.cost, pixels: a.pixels}])
                  } else {
                    const last = R.last(acc)
                    if(a.ip3 <= last.to + 8) {
                      return R.init(acc).concat([{
                          from: last.from, to: a.ip3
                        , sales: a.sales + last.sales
                        , views: a.views + last.views
                        , firstbillings: a.firstbillings + last.firstbillings
                        , cost: a.cost + last.cost
                        , pixels: a.pixels + last.pixels
                      }])
                    } else {
                      return acc.concat([{from: a.ip3, to: a.ip3, sales: a.sales, views: a.views, firstbillings: a.firstbillings, cost: a.cost, pixels: a.pixels}])
                    }
                  }
              }, [])
            , R.applySpec({
                sales: R.pipe(R.map(x => x.sales), R.sum),
                views: R.pipe(R.map(x => x.views), R.sum),
                firstbillings: R.pipe(R.map(x => x.firstbillings), R.sum),
                cost: R.pipe(R.map(x => x.cost), R.sum),
                pixels: R.pipe(R.map(x => x.pixels), R.sum),
                values: R.sortBy(x => x.from)
              })
            )))
          , R.map(R.pipe(
                R.toPairs
              , R.map(([ip2, values]) => R.merge({ip2: parseInt(ip2)}, values))
              , R.applySpec({
                  sales: R.pipe(R.map(x => x.sales), R.sum),
                  views: R.pipe(R.map(x => x.views), R.sum),
                  firstbillings: R.pipe(R.map(x => x.firstbillings), R.sum),
                  cost: R.pipe(R.map(x => x.cost), R.sum),
                  pixels: R.pipe(R.map(x => x.pixels), R.sum),
                  values: R.sortBy(x => x.ip2) //R.sortBy(x => x.sales * -1)
                })
            ))
          , R.toPairs
          , R.map(([ip1, values]) => R.merge({ip1: parseInt(ip1)}, values))
          , R.sortBy(x => x.ip1)
          , R.chain(({ip1, values}) =>
              R.map(R.merge({ip1: ip1}))(values)
            )
          , R.chain(({ip1, ip2, values}) =>
              R.map(R.merge({ip1, ip2}))(values)
            )
          , R.map(({ip1, ip2, from, to, sales, views, firstbillings, cost, pixels}) => ({
              from: `${ip1}.${ip2}.${from}.0`,
              to: `${ip1}.${ip2}.${to}.255`,
              views: views,
              sales: sales,
              firstbillings: firstbillings,
              cost: cost,
              pixels: pixels
            }))
        )
      )
      , R.toPairs
      , R.map(([section, data]) => ({section, data}))
    ))
  
    , R.toPairs
    , R.map(([page, values]) => ({
        page, 
        data: R.map(y => R.merge(y, {
            page
          , data: y.data.map(R.compose(add_ratios, R.merge({page,section:y.section}))) 
        }) )(values)
    }))
    
    , R.map(({page, data}) => 
      ({
          page
        , data: R.map(({section, data}) => 
          R.merge(reduce_data(data), {
              section
            , data: data
          }))(data)
      })
    )
    , R.map(({page, data}) => R.merge(reduce_data(data), {page, data}))
  )(data)
}