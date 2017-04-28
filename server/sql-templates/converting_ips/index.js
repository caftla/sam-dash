const R = require('ramda')

module.exports = (params) =>  R.pipe(
    R.groupBy(x => x.operator_code)
  , R.map(
R.pipe(
        R.map(R.applySpec({
            ips: x => x.ip3.split('.').map(x => parseInt(x))
          , sales: x => x.sales
          , firstbillings: x => x.firstbillings
          , views: x => x.views
        }))
      , R.groupBy(x => x.ips[0])
      , R.map(R.groupBy(x => x.ips[1]))
      , R.map(R.map(R.pipe(
          R.map(R.applySpec({
              ip3: x => x.ips[2]
            , sales: x => x.sales
            , firstbillings: x => x.firstbillings
            , views: x => x.views
          }))
        , R.sortBy(x => x.ip3)
        , R.reduce(
            (acc, a) => { if(acc.length == 0) {
                return acc.concat([{
                    from: a.ip3, to: a.ip3
                  , sales: a.sales, views: a.views, firstbillings: a.firstbillings}])
              } else {
                const last = R.last(acc)
                if(a.ip3 <= last.to + 4) {
                  return R.init(acc).concat([{
                      from: last.from, to: a.ip3
                    , sales: a.sales + last.sales
                    , views: a.views + last.views
                    , firstbillings: a.firstbillings + last.firstbillings
                  }])
                } else {
                  return acc.concat([{from: a.ip3, to: a.ip3, sales: a.sales, views: a.views, firstbillings: a.firstbillings}])
                }
              }
          }, [])
        , R.applySpec({
            sales: R.pipe(R.map(x => x.sales), R.sum),
            views: R.pipe(R.map(x => x.views), R.sum),
            firstbillings: R.pipe(R.map(x => x.firstbillings), R.sum),
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
      , R.map(({ip1, ip2, from, to, sales, views, firstbillings}) => ({
          from: `${ip1}.${ip2}.${from}.0`,
          to: `${ip1}.${ip2}.${to}.255`,
          views: views,
          sales: sales,
          firstbillings: firstbillings
        }))
    )
  )

  , R.toPairs
  , R.map(([operator, values]) => ({page: operator, data: R.map(R.merge({operator}))(values)}))
)
