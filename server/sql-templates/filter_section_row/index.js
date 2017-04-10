const R = require('ramda')

module.exports = (params) => R.pipe(
      R.sortBy(x => params.section == 'day' ? new Date(x.section + 'Z').valueOf() : x.sales * -1 )
    , R.map(c => R.merge(c, { data: R.sortBy(x =>
        params.row == 'day' ? new Date(x.row + 'Z').valueOf() : x.row
      )(c.data) }))
  )
