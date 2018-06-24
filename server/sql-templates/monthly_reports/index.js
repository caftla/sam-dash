// @flow

const R = require('ramda')


const transform = params => R.pipe(
    R.groupBy(x => `${x.section}-${x.year_code}-${x.month_code}`)
  , R.map(R.reduce(R.merge, {}))
  , R.values
  , R.groupBy(x => `${x.section}`)
  , R.toPairs
  , R.map(([section, data]) => ({section, data}))
  , xs => {
      const date_keys = R.pipe(
          R.chain(x => x.data)
        , R.map(x => ({year_code: x.year_code, month_code: x.month_code}))
        , R.uniq
        , R.sortBy(x => x.year_code * 12 + x.month_code)
      )(xs)

      return R.pipe(
        R.map(({section, data}) => ({
            section
          , data: date_keys.map(({year_code, month_code}) => R.merge({year_code, month_code},
              data.find(x => x.year_code == year_code && x.month_code == month_code)
            ))
        }))
      )(xs)
    }
)
module.exports = transform
