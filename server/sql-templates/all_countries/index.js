const R = require('ramda')

const fields = [
    'operator_code'
  , 'handle_name'
  , 'platform'
  , 'gateway'
  , 'ad_name'
  , 'scenario_name'
  , 'service_identifier1'
  , 'affiliate_name'
]

module.exports = (params) => R.pipe(
    R.groupBy(x => x.country_code)
  , R.map(ds => fields.map(f => [`${f}s`, R.pipe(R.map(x => x[f]), R.uniq, R.reject(x => !x), R.sortBy(x => x))(ds)]))
  , R.map(R.fromPairs)
  , R.toPairs
  , R.map(([country_code, rest]) => R.merge({country_code}, rest))
  , R.sortBy(x => x.country_code)
)