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
    , paid_ratio: safe_div(x.paid, x.sales)
    , paid_active_ratio: safe_div(x.paid_active, x.paid)
    , cq_active72: safe_div(x.cq_active72, x.sales)
    , ecpa: safe_div(x.cost, x.sales)
    , cpa: safe_div(x.cost, x.pixels)
    , pixels_ratio: safe_div(x.pixels, x.sales)
    , resubs_ratio: safe_div(x.resubs, x.sales)
    , firstbillings_and_active24: safe_div(x.firstbillings && x.optout_24h, x.sales)

    , arpu_week_1  : safe_div(x.revenue_week_1  , x.sales_week_1  )
    , arpu_week_2  : safe_div(x.revenue_week_2  , x.sales_week_2  )
    , arpu_week_3  : safe_div(x.revenue_week_3  , x.sales_week_3  )
    , arpu_month_1 : safe_div(x.revenue_month_1 , x.sales_month_1 )
    , arpu_month_2 : safe_div(x.revenue_month_2 , x.sales_month_2 )
    , arpu_month_3 : safe_div(x.revenue_month_3 , x.sales_month_3 )
    , arpu_month_4 : safe_div(x.revenue_month_4 , x.sales_month_4 )
    , arpu_month_5 : safe_div(x.revenue_month_5 , x.sales_month_5 )
    , arpu_month_6 : safe_div(x.revenue_month_6 , x.sales_month_6 )
    , arpu_month_7 : safe_div(x.revenue_month_7 , x.sales_month_7 )
    , arpu_month_8 : safe_div(x.revenue_month_8 , x.sales_month_8 )
    , arpu_month_9 : safe_div(x.revenue_month_9 , x.sales_month_9 )
    , arpu_month_10: safe_div(x.revenue_month_10, x.sales_month_10)
    , arpu_month_11: safe_div(x.revenue_month_11, x.sales_month_11)
    , arpu_month_12: safe_div(x.revenue_month_12, x.sales_month_12)

  })
  
 const reduce_data = data => {
   return add_ratios(data.reduce(
      (acc, a) =>
        R.merge(acc, {
              cost: a.cost + acc.cost
            , sales: a.sales + acc.sales
            , pixels: a.pixels + acc.pixels
            , optout_24h: a.optout_24h + acc.optout_24h
            , optouts: a.optouts + acc.optouts
            , paid: a.paid + acc.paid
            , paid_active: a.paid_active + acc.paid_active
            , cq_active72: a.cq_active72 + acc.cq_active72
            , firstbillings: a.firstbillings + acc.firstbillings
            , resubs: a.resubs + acc.resubs

            , revenue_week_1: a.revenue_week_1 + acc.revenue_week_1
            , revenue_week_2: a.revenue_week_2 + acc.revenue_week_2
            , revenue_week_3: a.revenue_week_3 + acc.revenue_week_3
            , revenue_month_1: a.revenue_month_1 + acc.revenue_month_1
            , revenue_month_2: a.revenue_month_2 + acc.revenue_month_2
            , revenue_month_3: a.revenue_month_3 + acc.revenue_month_3
            , revenue_month_4: a.revenue_month_4 + acc.revenue_month_4
            , revenue_month_5: a.revenue_month_5 + acc.revenue_month_5
            , revenue_month_6: a.revenue_month_6 + acc.revenue_month_6
            , revenue_month_7: a.revenue_month_7 + acc.revenue_month_7
            , revenue_month_8: a.revenue_month_8 + acc.revenue_month_8
            , revenue_month_9: a.revenue_month_9 + acc.revenue_month_9
            , revenue_month_10: a.revenue_month_10 + acc.revenue_month_10
            , revenue_month_11: a.revenue_month_11 + acc.revenue_month_11
            , revenue_month_12: a.revenue_month_12 + acc.revenue_month_12

            , sales_week_1: a.sales_week_1 + acc.sales_week_1
            , sales_week_2: a.sales_week_2 + acc.sales_week_2
            , sales_week_3: a.sales_week_3 + acc.sales_week_3
            , sales_month_1: a.sales_month_1 + acc.sales_month_1
            , sales_month_2: a.sales_month_2 + acc.sales_month_2
            , sales_month_3: a.sales_month_3 + acc.sales_month_3
            , sales_month_4: a.sales_month_4 + acc.sales_month_4
            , sales_month_5: a.sales_month_5 + acc.sales_month_5
            , sales_month_6: a.sales_month_6 + acc.sales_month_6
            , sales_month_7: a.sales_month_7 + acc.sales_month_7
            , sales_month_8: a.sales_month_8 + acc.sales_month_8
            , sales_month_9: a.sales_month_9 + acc.sales_month_9
            , sales_month_10: a.sales_month_10 + acc.sales_month_10
            , sales_month_11: a.sales_month_11 + acc.sales_month_11
            , sales_month_12: a.sales_month_12 + acc.sales_month_12
        })
      , {
            cost: 0
          , sales: 0
          , pixels: 0
          , optout_24h: 0
          , optouts: 0
          , paid_active: 0
          , cq_active72: 0
          , firstbillings: 0
          , resubs: 0

          , revenue_week_1: 0
          , revenue_week_2: 0
          , revenue_week_3: 0
          , revenue_month_1: 0
          , revenue_month_2: 0
          , revenue_month_3: 0
          , revenue_month_4: 0
          , revenue_month_5: 0
          , revenue_month_6: 0
          , revenue_month_7: 0
          , revenue_month_8: 0
          , revenue_month_9: 0
          , revenue_month_10: 0
          , revenue_month_11: 0
          , revenue_month_12: 0

          , sales_week_1: 0
          , sales_week_2: 0
          , sales_week_3: 0
          , sales_month_1: 0
          , sales_month_2: 0
          , sales_month_3: 0
          , sales_month_4: 0
          , sales_month_5: 0
          , sales_month_6: 0
          , sales_month_7: 0
          , sales_month_8: 0
          , sales_month_9: 0
          , sales_month_10: 0
          , sales_month_11: 0
          , sales_month_12: 0
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