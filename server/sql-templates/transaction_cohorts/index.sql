with RockmanIds as (
  select S.rockman_id, S."timestamp", S.sale
  from user_subscriptions S
  where S.timestamp >=  $[params.from_date_tz]$
    and S.timestamp <  $[params.to_date_tz]$
    and $[params.f_filter('S', {fieldMap: {'publisher_id': 'pubid'}})]$

)
, 
TransactionsStats as (

  select 
      sum(1) as total
    , sum(case when t.dnstatus = 'Pending' then 1 else 0 end) :: int as pending 
    , sum(case when t.dnstatus = 'Delivered' then 1 else 0 end) :: int as delivered
    , sum(case when t.dnstatus = 'Refunded' then 1 else 0 end) :: int as refunded
    , sum(case when t.dnstatus = 'Failed' then 1 else 0 end) :: int as failed
    , sum(case when t.dnstatus not in ('Pending', 'Delivered', 'Refunded', 'Failed') then 1 else 0 end) :: int as unknown 
    , sum(case when t.dnstatus = 'Delivered' then t.tariff else 0 end) as revenue
    , count(distinct t.rockman_id) as activley_attempted_users
    , ((datediff('day', S.timestamp, T.timestamp) / $[params.resolution]$) * 
        $[params.resolution]$) :: int as days_after_sale
    , date_trunc('$[params.cohort]$', S.timestamp) :: TIMESTAMP AT TIME ZONE 'UTC' as sale_date
  from transactions as T
  inner join RockmanIds S on T.rockman_id = S.rockman_id
  where T.timestamp >= $[params.from_date_tz]$
    and T.timestamp <  $[params.to_date_tz]$
    and T.tariff > 0
    and $[params.f_filter('T', {fieldMap: {'publisher_id': 'pubid'}})]$
  group by sale_date, days_after_sale
)
, Sales as (
  select 
    sum(R.sale) as sales
  , date_trunc('$[params.cohort]$', R.timestamp) :: TIMESTAMP AT TIME ZONE 'UTC' as sale_date
  
  from RockmanIds as R
  group by sale_date
  
)

, SalesTransactions as (
  select
    R.rockman_id
  , date_trunc('$[params.cohort]$', R.timestamp) :: TIMESTAMP AT TIME ZONE 'UTC' as sale_date
  , min(((datediff('day', R.timestamp, T.timestamp) / $[params.resolution]$) * 
    $[params.resolution]$) :: int) as first_delivered_transaction_days_after_sale
  , max(((datediff('day', R.timestamp, T.timestamp) / $[params.resolution]$) * 
    $[params.resolution]$) :: int) as last_delivered_transaction_days_after_sale
  from RockmanIds R
  left join transactions T on T.rockman_id = R.rockman_id
  where T.dnstatus = 'Delivered'
    AND T.timestamp >= R.timestamp
    AND T.timestamp <  $[params.to_date_tz]$
    and T.tariff > 0
    and $[params.f_filter('T', {fieldMap: {'publisher_id': 'pubid'}})]$
  group by R.rockman_id, sale_date
)

, FirstSalesTransactionsStats as (
  select 
    sale_date, first_delivered_transaction_days_after_sale
  , count(*) as how_many
  from SalesTransactions
  group by sale_date, first_delivered_transaction_days_after_sale
)

, LastSalesTransactionsStats as (
  select 
    sale_date, last_delivered_transaction_days_after_sale
  , count(*) as how_many
  from SalesTransactions
  group by sale_date, last_delivered_transaction_days_after_sale
)


select S.sales, T.*
, dateadd('day', T.days_after_sale, T.sale_date :: TIMESTAMP)  :: TIMESTAMP AT TIME ZONE 'UTC' as current_date
, coalesce(FSDT.how_many, 0) as users_with_first_delivered_transaction
, coalesce(LSDT.how_many, 0) as users_with_last_delivered_transaction
, sum(coalesce(T.revenue, 0))  over (PARTITION BY T.sale_date  ORDER BY T.days_after_sale ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as total_revenue_from_this_cohort_by_this_row
from  TransactionsStats T 
inner join Sales S on T.sale_date = S.sale_date
left join FirstSalesTransactionsStats FSDT on FSDT.sale_date = T.sale_date and FSDT.first_delivered_transaction_days_after_sale = T.days_after_sale
left join LastSalesTransactionsStats LSDT on LSDT.sale_date = T.sale_date and LSDT.last_delivered_transaction_days_after_sale = T.days_after_sale
order by S.sale_date DESC, T.days_after_sale DESC