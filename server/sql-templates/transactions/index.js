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
      pending_rate: safe_div(x.total_pending, x.total_transactions)
    , delivered_rate: safe_div(x.total_delivered, x.total_transactions)
    , failed_rate: safe_div(x.total_failed, x.total_transactions)
    , paying_users_rate: safe_div(x.paying_users, x.total_users)
  })
  
 const reduce_data = data => {
   return add_ratios(data.reduce(
      (acc, a) =>
        R.merge(acc, {
            total_pending: a.total_pending + acc.total_pending
          , total_delivered: a.total_delivered + acc.total_delivered
          , total_refunded: a.total_refunded + acc.total_refunded
          , total_failed: a.total_failed + acc.total_failed
          , unknown: a.unknown + acc.unknown
          , total_transactions: a.total_transactions + acc.total_transactions
          , total_users: +a.total_users + acc.total_users
          , paying_users: +a.paying_users + acc.paying_users
        })
      , {total_pending: 0, total_delivered: 0, total_refunded: 0, total_failed: 0, unknown: 0, total_transactions: 0, total_users: 0, paying_users: 0}
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
              , median_delivered_per_paying_user: data[0].median_delivered_per_paying_user_at_section_level
              , avg_delivered_per_paying_user: data[0].avg_delivered_per_paying_user_at_section_level
              , avg_count_of_transactions_for_a_paying_user: data[0].count_of_transactions_for_a_paying_user_at_section_level
              , avg_tariff_per_paying_user: data[0].avg_tariff_per_paying_user_at_section_level
              , data: R.pipe(
                  R.map(x => R.merge(x, { section_total_transactions_ratio: safe_div(x.total_transactions, reduced_section.total_transactions) }))
                , R.sortBy(x => is_date_param(params.row) ? new Date(x.row).valueOf() : x.row)
              )(data) 
            })
        })
        , R.sortBy(x => {
           return is_date_param(params.section) ? new Date(x.section).valueOf() : x.total_transactions * -1
        })
      ))
    , R.toPairs
    , R.map(([page, data]) => R.merge(reduce_data(data), {
          page
          , median_delivered_per_paying_user: data[0].data[0].median_delivered_per_paying_user_at_page_level
          , avg_delivered_per_paying_user: data[0].avg_delivered_per_paying_user_at_page_level
          , avg_count_of_transactions_for_a_paying_user: data[0].data[0].count_of_transactions_for_a_paying_user_at_page_level
          , avg_tariff_per_paying_user: data[0].data[0].avg_tariff_per_paying_user_at_page_level
        , data}))
    , R.sortBy(x => is_date_param(params.page) ? new Date(x.page).valueOf() : x.total_transactions * -1)
  )
}