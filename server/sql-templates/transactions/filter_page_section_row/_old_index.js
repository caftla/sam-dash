const R = require('ramda')

module.exports = (params) => {
  const is_date_param = param_value => ['day', 'week', 'month'].some(p => p == param_value)
  return R.pipe(
      R.sortBy(x => is_date_param(params.page) ? new Date(x.page + 'Z').valueOf() : x.sales * -1 )
    , R.map(x => R.merge(x, {
          page: is_date_param(params.page) ? x.page.substr(0, 10) : x.page
        , data: R.pipe(
              R.filter(x => x.sales > 0 || x.views > 0)
            , R.sortBy(x => is_date_param(params.section) ? new Date(x.section + 'Z').valueOf() : x.sales * -1 )
            , R.map(c => R.merge(c, { 
                section: is_date_param(params.section) ? c.section.substr(0, 10) : c.section 
              , page: is_date_param(params.page) ? c.page.substr(0, 10) : c.page
              , data: R.pipe(
                    R.filter(x => x.sales > 0 || x.views > 0)
                  , R.sortBy(x => is_date_param(params.row) ? new Date(x.row + 'Z').valueOf() : x.row)
                  , R.map(x => R.merge(x, {
                        row: is_date_param(params.row) ? x.row.substr(0, 10) : x.row
                      , section: is_date_param(params.section) ? x.section.substr(0, 10) : x.section 
                      , page: is_date_param(params.page) ? x.page.substr(0, 10) : x.page
                    }))
                )(c.data) }))
          )(x.data)
      }))
    // , R.filter(x => x.sales > 100 || x.views > 1000)
  )

}