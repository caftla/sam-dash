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
, U as (
  select  
    T.row
  , T.section
  , T.page
  , T.delivered
  , RANK() over (PARTITION BY T.row, T.section, T.page) as rnk 
  , PERCENTILE_CONT(0.25) WITHIN GROUP (ORDER BY T.delivered) over (PARTITION BY T.row, T.section, T.page) AS q1_delivered_per_paying_user
  , PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY T.delivered) over (PARTITION BY T.row, T.section, T.page) AS median_delivered_per_paying_user
  , PERCENTILE_CONT(0.75) WITHIN GROUP (ORDER BY T.delivered) over (PARTITION BY T.row, T.section, T.page) AS q3_delivered_per_paying_user
  , avg(T.delivered) over (PARTITION BY T.row, T.section, T.page) as avg_delivered_per_paying_user
  , min(T.delivered) over (PARTITION BY T.row, T.section, T.page) as abs_min_delivered_per_paying_user
  , max(T.delivered) over (PARTITION BY T.row, T.section, T.page) as abs_max_delivered_per_paying_user

  , PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY T.delivered) over (PARTITION BY T.page) AS median_delivered_per_paying_user_at_page_level
  , PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY T.delivered) over (PARTITION BY T.section, T.page) AS median_delivered_per_paying_user_at_section_level
  , avg(T.delivered) over (PARTITION BY T.page) as avg_delivered_per_paying_user_at_page_level
  , avg(T.delivered) over (PARTITION BY T.section, T.page) as avg_delivered_per_paying_user_at_section_level
  
  , STDDEV_POP(T.delivered) over (PARTITION BY T.row, T.section, T.page) as stddev_delivered_per_paying_user
  , count(*) over (PARTITION BY T.row, T.section, T.page) as total_users
  
  , sum(CASE WHEN T.count_of_transactions_for_a_paying_user > 0 then 1 else 0 end) over (PARTITION BY T.row, T.section, T.page) as paying_users
  , sum(T.total_tariff_per_user) over (PARTITION BY T.row, T.section, T.page) as sum_total_tarif
  , avg(T.total_tariff_per_user) over (PARTITION BY T.row, T.section, T.page) as avg_total_tariff_per_user
  , avg(T.avg_tariff_per_paying_user) over (PARTITION BY T.row, T.section, T.page) as avg_tariff_per_paying_user
  , avg(T.transactions) over (PARTITION BY T.row, T.section, T.page) as avg_transactions_per_user
  , avg(T.count_of_transactions_for_a_paying_user) over (PARTITION BY T.row, T.section, T.page) as avg_count_of_transactions_for_a_paying_user

  , avg(T.count_of_transactions_for_a_paying_user) over (PARTITION BY T.page) as count_of_transactions_for_a_paying_user_at_page_level
  , avg(T.count_of_transactions_for_a_paying_user) over (PARTITION BY T.section, T.page) as count_of_transactions_for_a_paying_user_at_section_level
  , avg(T.avg_tariff_per_paying_user) over (PARTITION BY T.page) as avg_tariff_per_paying_user_at_page_level
  , avg(T.avg_tariff_per_paying_user) over (PARTITION BY T.section, T.page) as avg_tariff_per_paying_user_at_section_level
  
  , sum(T.transactions) over (PARTITION BY T.row, T.section, T.page) as total_transactions
  , sum(T.delivered) over (PARTITION BY T.row, T.section, T.page) as total_delivered 
  , sum(T.pending) over (PARTITION BY T.row, T.section, T.page) as total_pending 
  , sum(T.refunded) over (PARTITION BY T.row, T.section, T.page) as total_refunded 
  , sum(T.failed) over (PARTITION BY T.row, T.section, T.page) as total_failed 

  from T 
  -- where T.delivered > 0
)
select 
  U.row
, U.section
, U.page
  -- paying_user math
, MIN(CASE WHEN U.delivered >= U.q1_delivered_per_paying_user - ((U.q3_delivered_per_paying_user-U.q1_delivered_per_paying_user) * 1.5) THEN U.delivered ELSE NULL END) AS min_delivered_per_paying_user
, MAX(U.abs_min_delivered_per_paying_user) as abs_min_delivered_per_paying_user
, MAX(CASE WHEN U.delivered <= U.q3_delivered_per_paying_user + ((U.q3_delivered_per_paying_user-U.q1_delivered_per_paying_user) * 1.5) THEN U.delivered ELSE NULL END) AS max_delivered_par_paying_user
, MAX(U.abs_max_delivered_per_paying_user) as abs_max_delivered_per_paying_user
, MAX(U.q1_delivered_per_paying_user) as q1_delivered_per_paying_user
, MAX(U.median_delivered_per_paying_user) as median_delivered_per_paying_user
, MAX(U.q3_delivered_per_paying_user) as q3_delivered_per_paying_user
, MAX(avg_delivered_per_paying_user) AS avg_delivered_per_paying_user
, MAX(stddev_delivered_per_paying_user) AS stddev_delivered_per_paying_user
, MAX(avg_tariff_per_paying_user) as avg_tariff_per_paying_user
, MAX(avg_count_of_transactions_for_a_paying_user) as avg_count_of_transactions_for_a_paying_user
, MAX(paying_users) AS paying_users

, MAX(U.median_delivered_per_paying_user_at_page_level) as median_delivered_per_paying_user_at_page_level
, MAX(U.median_delivered_per_paying_user_at_section_level) as median_delivered_per_paying_user_at_section_level
, MAX(avg_delivered_per_paying_user_at_page_level) as avg_delivered_per_paying_user_at_page_level
, MAX(avg_delivered_per_paying_user_at_section_level) as avg_delivered_per_paying_user_at_section_level
, MAX(avg_tariff_per_paying_user_at_page_level) as avg_tariff_per_paying_user_at_page_level
, MAX(avg_tariff_per_paying_user_at_section_level) as avg_tariff_per_paying_user_at_section_level

, MAX(sum_total_tarif) AS sum_total_tarif
, MAX(avg_total_tariff_per_user) AS avg_total_tariff_per_user
, MAX(avg_transactions_per_user) AS avg_transactions_per_user

, coalesce(MAX(total_users), 0) as total_users
, coalesce(MAX(total_transactions), 0) as total_transactions
, coalesce(MAX(total_delivered), 0) as total_delivered
, coalesce(MAX(total_pending), 0) as total_pending
, coalesce(MAX(total_refunded), 0) as total_refunded
, coalesce(MAX(total_failed), 0) as total_failed

, MAX(count_of_transactions_for_a_paying_user_at_page_level) AS count_of_transactions_for_a_paying_user_at_page_level
, MAX(count_of_transactions_for_a_paying_user_at_section_level) AS count_of_transactions_for_a_paying_user_at_section_level


from U

group by U.page, U.section, U.row
order by U.page, U.section, U.row