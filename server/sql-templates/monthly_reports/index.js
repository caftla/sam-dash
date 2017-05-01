// @flow

const query = require('../../sql-api')
const fs = require('fs')
const R = require('ramda')

const transform = R.pipe(
    R.chain(x => x)
  , R.groupBy(x => `${x.country_code}-${x.operator_code}-${x.year_code}-${x.month_code}`)
  , R.map(R.reduce(R.merge, {}))
  , R.values
  , R.groupBy(x => `${x.country_code}-${x.operator_code}`)
  , R.toPairs
  , R.map(([operator_code, data]) => ({operator_code, data}))
  , xs => {
      const date_keys = R.pipe(
          R.chain(x => x.data)
        , R.map(x => ({year_code: x.year_code, month_code: x.month_code}))
        , R.uniq
        , R.sortBy(x => x.year_code * 12 + x.month_code)
      )(xs)

      return R.pipe(
        R.map(({operator_code, data}) => ({
            operator_code
          , data: date_keys.map(({year_code, month_code}) => R.merge({year_code, month_code},
              data.find(x => x.year_code == year_code && x.month_code == month_code)
            ))
        }))
      )(xs)
    }

  // , R.find(x => x.operator_code == 'AE-AE_DU')
)

module.exports = async function (helix_connection_string: string, jewel_connection_string: string, params: Object) {
  const jewel = () => Promise.all(['broadcast', 'optouts'].map(x =>
    query(jewel_connection_string, fs.readFileSync(`./server/sql-templates/monthly_reports/${x}.sql`, 'utf8'), params)
  ))

  const helix = () => Promise.all(['rps', 'drt'].map(x =>
    query(helix_connection_string, fs.readFileSync(`./server/sql-templates/monthly_reports/${x}.sql`, 'utf8'), params)
  ))

  const res = await Promise.all([jewel(), helix()])
  .then(R.pipe(R.chain(x => x), R.map(x => x.rows)))

  return transform(res)
}
