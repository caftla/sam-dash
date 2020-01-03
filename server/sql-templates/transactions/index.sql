with S as (
  select 
    $[params.f_page('t', 'timestamp', {no_timezone: 0})]$ as page
  , $[params.f_section('t', 'timestamp', {no_timezone: 0})]$ as section
  , $[params.f_row('t', 'timestamp', {no_timezone: 0})]$ as row
  , t.rockman_id 
  , (case when t.dnstatus = 'Delivered' then 1 else null end) :: float as delivered
  , (case when t.dnstatus = 'Pending' then 1 else null end) :: float as pending
  , (case when t.dnstatus = 'Refunded' then 1 else null end) :: float as refunded
  , (case when t.dnstatus = 'Failed' then 1 else null end) :: float as failed
  , 1 :: float as transactions
  , (case when t.dnstatus = 'Delivered' then t.tariff else 0 end) :: float as total_tariff_per_user
  , (case when t.dnstatus = 'Delivered' then t.tariff else null end) :: float as avg_tariff_per_paying_user
  , sum(case when t.dnstatus = 'Delivered' then 1 else 0 end) over (PARTITION by t.rockman_id, row, section, page)  as count_of_delivered_transactions_for_this_user_on_this_day
  from transactions t
  where t.timestamp >= $[params.from_date_tz]$
    and t.timestamp < $[params.to_date_tz]$
    and t.tariff > 0
    and $[params.f_filter('t')]$
)
, T AS (
  select 
    S.row
  , S.section
  , S.page
  , S.rockman_id
  , SUM(S.delivered) as delivered
  , SUM(S.pending) as pending
  , SUM(S.refunded) as refunded
  , SUM(S.failed) as failed
  , SUM(transactions) as transactions
  , SUM(total_tariff_per_user) as total_tariff_per_user
  , avg(avg_tariff_per_paying_user) as avg_tariff_per_paying_user
  , SUM(CASE WHEN count_of_delivered_transactions_for_this_user_on_this_day > 0 then S.transactions else null END) as count_of_transactions_for_a_paying_user
  from S
  group by S.row, S.section, S.page, S.rockman_id
)
, B_rsp AS (

  with S as (
  select 
    $[params.f_page('t', 'timestamp', {no_timezone: 0})]$ as page
  , $[params.f_section('t', 'timestamp', {no_timezone: 0})]$ as section
  , $[params.f_row('t', 'timestamp', {no_timezone: 0})]$ as row
  , t.rockman_id 
  , (case when t.dnstatus = 'Delivered' then 1 else null end) :: float as delivered
  , (case when t.dnstatus = 'Pending' then 1 else null end) :: float as pending
  , (case when t.dnstatus = 'Refunded' then 1 else null end) :: float as refunded
  , (case when t.dnstatus = 'Failed' then 1 else null end) :: float as failed
  , 1 :: float as transactions
  , (case when t.dnstatus = 'Delivered' then t.tariff else 0 end) :: float as total_tariff_per_user
  , (case when t.dnstatus = 'Delivered' then t.tariff else null end) :: float as avg_tariff_per_paying_user
  , sum(case when t.dnstatus = 'Delivered' then 1 else 0 end) over (PARTITION by t.rockman_id, row, section, page)  as count_of_delivered_transactions_for_this_user_on_this_day
  from transactions t
  where t.timestamp >= $[params.from_date_tz]$
    and t.timestamp < $[params.to_date_tz]$
    and t.tariff > 0
    and $[params.f_filter('t')]$
)
, T AS (
  select 
    S.row
  , S.section
  , S.page
  , S.rockman_id
  , SUM(S.delivered) as delivered
  , SUM(S.pending) as pending
  , SUM(S.refunded) as refunded
  , SUM(S.failed) as failed
  , SUM(transactions) as transactions
  , SUM(total_tariff_per_user) as total_tariff_per_user
  , avg(avg_tariff_per_paying_user) as avg_tariff_per_paying_user
  , SUM(CASE WHEN count_of_delivered_transactions_for_this_user_on_this_day > 0 then S.transactions else null END) as count_of_transactions_for_a_paying_user
  from S
  group by S.row, S.section, S.page, S.rockman_id
)
  select  
    T.row
  , T.section
  , T.page
  -- , PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY T.delivered) AS q1_delivered_per_paying_user
  , PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY T.delivered) AS median_delivered_per_paying_user
  -- , PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY T.delivered) AS q3_delivered_per_paying_user
  , avg(T.delivered) as avg_delivered_per_paying_user
  , min(T.delivered) as abs_min_delivered_per_paying_user
  , max(T.delivered) as abs_max_delivered_per_paying_user
  
  -- , STDDEV_POP(T.delivered) over (PARTITION BY T.d_row) as stddev_delivered_per_paying_user
  , count(*) as total_users
  
  , sum(CASE WHEN T.count_of_transactions_for_a_paying_user > 0 then 1 else 0 end) as paying_users
  -- , sum(T.total_tariff_per_user) as sum_total_tarif
  -- , avg(T.total_tariff_per_user) as avg_total_tariff_per_user
  , avg(T.avg_tariff_per_paying_user) as avg_tariff_per_paying_user
  -- , avg(T.transactions) as avg_transactions_per_user
  , avg(T.count_of_transactions_for_a_paying_user) as avg_count_of_transactions_for_a_paying_user
  -- 
  -- , avg(T.count_of_transactions_for_a_non_paying_user) as count_of_transactions_for_a_non_paying_user
  -- , avg(T.count_of_transactions_for_a_non_paying_user) as avg_count_of_transactions_for_a_non_paying_user
  -- , PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY T.count_of_transactions_for_a_non_paying_user) as q1_count_of_transactions_for_a_non_paying_user
  -- , PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY T.count_of_transactions_for_a_non_paying_user) as median_count_of_transactions_for_a_non_paying_user
  -- , PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY T.count_of_transactions_for_a_non_paying_user) as q3_count_of_transactions_for_a_non_paying_user
  
  -- , sum(CASE WHEN
  --       t.first_transaction_was_delivered = 0 AND T.delivered > 0 THEN 1 ELSE 0 END
  --   )  as count_of_paying_users_whose_first_transaction_failed
  
  , sum(T.transactions) as total_transactions
  , sum(T.delivered) as total_delivered 
  , sum(T.pending) as total_pending 
  , sum(T.failed) as total_failed
  , sum(T.refunded) as total_refunded
  from T


  group by T.page, T.section, T.row
  order by T.page, T.section, T.row
)
, B_p as (
  select  
   T.page
  , PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY T.delivered) AS median_delivered_per_paying_user
  , avg(T.delivered) as avg_delivered_per_paying_user
  
  , sum(CASE WHEN T.count_of_transactions_for_a_paying_user > 0 then 1 else 0 end) as paying_users

  , avg(T.avg_tariff_per_paying_user) as avg_tariff_per_paying_user
  , avg(T.count_of_transactions_for_a_paying_user) as avg_count_of_transactions_for_a_paying_user

  from T
  group by T.page

)

, B_ps as (
  select  
   T.page
  , T.section
  , PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY T.delivered) AS median_delivered_per_paying_user
  , avg(T.delivered) as avg_delivered_per_paying_user
  
  , sum(CASE WHEN T.count_of_transactions_for_a_paying_user > 0 then 1 else 0 end) as paying_users

  , avg(T.avg_tariff_per_paying_user) as avg_tariff_per_paying_user
  , avg(T.count_of_transactions_for_a_paying_user) as avg_count_of_transactions_for_a_paying_user

  from T
  group by T.page, T.section

)

select B_rsp.* 
, B_p.avg_delivered_per_paying_user as avg_delivered_per_paying_user_at_page_level
, B_p.median_delivered_per_paying_user as median_delivered_per_paying_user_at_page_level
, B_p.avg_tariff_per_paying_user as avg_tariff_per_paying_user_at_page_level
, B_p.avg_count_of_transactions_for_a_paying_user as count_of_transactions_for_a_paying_user_at_page_level

, B_ps.avg_delivered_per_paying_user as avg_delivered_per_paying_user_at_section_level
, B_ps.median_delivered_per_paying_user as median_delivered_per_paying_user_at_section_level
, B_ps.avg_tariff_per_paying_user as avg_tariff_per_paying_user_at_section_level
, B_ps.avg_count_of_transactions_for_a_paying_user as count_of_transactions_for_a_paying_user_at_section_level

from B_rsp
left join B_p on B_rsp.page = B_p.page
left join B_ps on B_rsp.page = B_ps.page and B_rsp.section = B_ps.section