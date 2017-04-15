const R = require('ramda')

module.exports = (params) => R.pipe(
      R.sortBy(x => params.page == 'day' ? new Date(x.page + 'Z').valueOf() : x.sales * -1 )
    , R.map(x => R.merge(x, {
        data: R.pipe(
            R.filter(x => x.sales > 0 || x.views > 0)
          , R.sortBy(x => params.section == 'day' ? new Date(x.section + 'Z').valueOf() : x.sales * -1 )
          , R.map(c => R.merge(c, { data: R.pipe(
                R.filter(x => x.sales > 0 || x.views > 0)
              , R.sortBy(x => params.row == 'day' ? new Date(x.row + 'Z').valueOf() : x.row)
            )(c.data) }))
        )(x.data)
      }))
    // , R.filter(x => x.sales > 100 || x.views > 1000)
  )
