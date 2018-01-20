const R = require('ramda')

module.exports = (params) => {
  const is_date_param = param_value => ['hour', 'day', 'week', 'month'].some(p => p == param_value)
  
  const id = x => x
  const format = R.pipe(
      is_date_param(params.row) ? x => R.merge(x, {row: new Date(x.row).toISOString()}) : id
    , is_date_param(params.section) ? x => R.merge(x, {section: new Date(x.section).toISOString()}) : id
    , is_date_param(params.page) ? x => R.merge(x, {page: new Date(x.page).toISOString()}) : id
  )

  const safe_div = (x, y) => y == 0 && x == 0 ? 0
    : y == 0 ? Infinity
    : x / y
    
    
  const add_ratios = x => R.merge(x, {
      cq: safe_div(x.firstbillings, x.sales)
    , active24: safe_div(x.sales - x.optout_24h, x.sales)
    , active: safe_div(x.sales - x.optouts, x.sales)
    , ecpa: safe_div(x.cost, x.sales)
    , cpa: safe_div(x.cost, x.pixels)
    , pixels_ratio: safe_div(x.pixels, x.sales)
    , resubs_ratio: safe_div(x.resubs, x.sales)
    , firstbillings_and_active24: safe_div(x.firstbillings && x.optout_24h, x.sales)
    , click_or_touch_ratio: safe_div(x.clicks_or_touches, x.views)
    , cr: safe_div(x.sales, x.views)
    , cr_pixels: safe_div(x.pixels, x.views)
    , lead1: safe_div(x.lead1s, x.views)
    , lead2: safe_div(x.lead2s, x.views)
    , any_leads_ratio: safe_div(x.any_leads, x.views)
    , bad_pixels_ratio: safe_div(x.pixels_for_no_firstbilling + x.pixels_for_resubs, x.pixels)
    , missed_good_pixels_ratios: safe_div(x.missed_good_pixels, x.sales)
    // , resubs7_ratio: 1 - safe_div(x.unique_sales, x.non_unique_sales)
  })
  
 const reduce_data = data => {
   return add_ratios(data.reduce(
      (acc, a) =>
        R.merge(acc, {
            views: a.views + acc.views
          , cost: a.cost + acc.cost
          , sales: a.sales + acc.sales
          , pixels: a.pixels + acc.pixels
          , optout_24h: a.optout_24h + acc.optout_24h
          , optouts: a.optouts + acc.optouts
          , firstbillings: a.firstbillings + acc.firstbillings
          , resubs: a.resubs + acc.resubs
          // , non_unique_sales: a.non_unique_sales + acc.non_unique_sales
          // , unique_sales: a.unique_sales + acc.unique_sales
          , clicks_or_touches: a.clicks_or_touches + acc.clicks_or_touches
          , lead1s: a.lead1s + acc.lead1s
          , lead2s: a.lead2s + acc.lead2s
          , any_leads: a.any_leads + acc.any_leads
          , pixels_for_resubs: a.pixels_for_resubs + acc.pixels_for_resubs
          , pixels_for_no_firstbilling: a.pixels_for_no_firstbilling + acc.pixels_for_no_firstbilling
          , missed_good_pixels: a.missed_good_pixels + acc.missed_good_pixels

        })
      , {
            views: 0
          , cost: 0
          , sales: 0
          , pixels: 0
          , optout_24h: 0
          , optouts: 0
          , firstbillings: 0
          , resubs: 0
          // , non_unique_sales: 0
          // , unique_sales: 0
          , clicks_or_touches: 0
          , lead1s: 0
          , lead2s: 0
          , any_leads: 0
          , pixels_for_resubs: 0
          , pixels_for_no_firstbilling: 0
          , missed_good_pixels: 0
        }
    ))
  }
  
  return R.pipe(
      R.map(format)
    , R.map(add_ratios)
    , R.groupBy(p => p.page)  
    , R.map(R.pipe(
          R.groupBy(s => s.section)
        , R.toPairs
        , R.map(([section, data]) => {
            const reduced_section = reduce_data(data)
            return R.merge(reduced_section, {
                section
              , page: data[0].page
              , data: R.pipe(
                  R.map(x => R.merge(x, { section_total_ratio: safe_div(x.total, reduced_section.total) }))
                , R.sortBy(x => is_date_param(params.row) ? new Date(x.row).valueOf() : x.row)
              )(data) 
            })
        })
        , R.sortBy(x => {
           return is_date_param(params.section) ? new Date(x.section).valueOf() : x.total * -1
        })
      ))
    , R.toPairs
    , R.map(([page, data]) => R.merge(reduce_data(data), {page, data}))
    , R.sortBy(x => is_date_param(params.page) ? new Date(x.page).valueOf() : x.total * -1)
  )
}