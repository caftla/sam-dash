// @flow

const query = require('../../sql-api')
const fs = require('fs')
const R = require('ramda')

const trace = (x, y) => { console.log(x); return y; }
const trace_ = x => trace(x, x)

const transform = R.pipe(
    R.chain(x => x)
  , R.groupBy(x => `${x.country_code}-${x.gateway}-${x.year_code}-${x.month_code}`)
  , R.map(R.reduce(R.merge, {}))
  , R.values
  , R.groupBy(x => `${x.country_code}-${x.gateway}`)
  , R.toPairs
  , R.map(([gateway, data]) => ({gateway, data}))
  , xs => {
      const date_keys = R.pipe(
          R.chain(x => x.data)
        , R.map(x => ({year_code: x.year_code, month_code: x.month_code}))
        , R.uniq
        , R.sortBy(x => x.year_code * 12 + x.month_code)
      )(xs)

      return R.pipe(
        R.map(({gateway, data}) => ({
            operator_code: gateway
          , data: date_keys.map(({year_code, month_code}) => R.merge({year_code, month_code},
              data.find(x => x.year_code == year_code && x.month_code == month_code)
            ))
        }))
      )(xs)
    }

  // , R.find(x => x.gateway == 'AE-AE_DU')
)

module.exports = async function (helix_connection_string: string, jewel_connection_string: string, params: Object) {
  const jewel = () => Promise.all(['broadcast', 'optouts'].map(x =>
    query(jewel_connection_string, fs.readFileSync(`./server/sql-templates/monthly_reports_gateways/${x}.sql`, 'utf8'), params)
  ))

  const helix = () => Promise.all(['rps', 'drt'].map(x =>
    query(helix_connection_string, fs.readFileSync(`./server/sql-templates/monthly_reports_gateways/${x}.sql`, 'utf8'), params)
    .then(r => x == 'rps' ? R.find(y => y.rows.length > 0)(r) : r)
  ))

  const res = await Promise.all([jewel(), helix()])
  .then(R.pipe(R.chain(x => x), R.map(x => x.rows)))

  return transform(res)
}
