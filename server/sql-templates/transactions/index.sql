with S as (
  select 
    $[params.f_page('t', 'timestamp', {no_timezone: 0})]$ as page
  , $[params.f_section('t', 'timestamp', {no_timezone: 0})]$ as section
  , $[params.f_row('t', 'timestamp', {no_timezone: 0})]$ as row
  , coalesce(t.rockman_id, t.service_identifier1 || '-' || t.msisdn) as rockman_id
  , (case when t.dnstatus = 'Delivered' then 1 else null end) :: float as delivered
  , (case when t.dnstatus = 'Pending' then 1 else null end) :: float as pending
  , (case when t.dnstatus = 'Refunded' then 1 else null end) :: float as refunded
  , (case when t.dnstatus = 'Failed' then 1 else null end) :: float as failed
  , 1 :: float as transactions
  , (case when t.dnstatus = 'Delivered' then t.tariff else 0 end) :: float as total_tariff_per_user
  , (case when t.dnstatus = 'Delivered' then t.tariff else null end) :: float as avg_tariff_per_paying_user
  -- , sum(case when t.dnstatus = 'Delivered' then 1 else 0 end) over (PARTITION by t.rockman_id, row, section, page)  as count_of_delivered_transactions_for_this_user_on_this_day
  , row_number() over (PARTITION by t.rockman_id, date_trunc('day', CONVERT_TIMEZONE('UTC', '0', t.timestamp)) :: timestamp AT TIME ZONE '0'  order by t.timestamp asc, t.update_timestamp asc)  as transaction_rank_for_user
  
  -- , (t.timestamp - us.sale_timestamp > '1 day' :: INTERVAL ) as older_than_one_day
  , (CASE
      WHEN (t.timestamp - current_date) < '1 day' :: INTERVAL AND  (t.timestamp - current_date) > '-1 day' :: INTERVAL THEN NULL
      WHEN t.update_timestamp is null then 1
      WHEN (t.update_timestamp - t.timestamp > '1 day' :: INTERVAL) THEN 1 
    ELSE 0 END) as pending_for_longer_then_one_day

  , t.timestamp
  from transactions t
  -- inner join user_subscriptions us on us.rockman_id = t.rockman_id
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
  , coalesce(SUM(S.pending), 0) as pending
  , coalesce(SUM(S.refunded), 0) as refunded
  , coalesce(SUM(S.failed), 0) as failed
  , SUM(transactions) as transactions
  , SUM(total_tariff_per_user) as total_tariff_per_user
  , avg(avg_tariff_per_paying_user) as avg_tariff_per_paying_user
  , SUM(CASE WHEN S.delivered > 0 
             THEN S.transactions 
             ELSE NULL END
        ) as count_of_transactions_for_a_paying_user
  -- , SUM(CASE WHEN S.older_than_one_day and S.delivered > 0 
  --            THEN S.transactions 
  --            ELSE NULL END
  --       ) as count_of_transactions_for_a_paying_user_older_than_one_day
  , max(CASE WHEN S.transaction_rank_for_user = 1 
             THEN S.delivered -- 1 or 0
             ELSE NULL END
        ) as first_transaction_was_delivered
  , max(CASE WHEN S.transaction_rank_for_user = 2
             THEN S.delivered -- 1 or 0 
             ELSE NULL END
        ) as second_transaction_was_delivered
  , max(CASE WHEN S.transaction_rank_for_user = 3
             THEN S.delivered -- 1 or 0 
             ELSE NULL END
        ) as third_transaction_was_delivered
  , sum(S.pending_for_longer_then_one_day) as transactions_pending_for_longer_then_one_day
  from S
  group by S.row, S.section, S.page, S.rockman_id
)
, B_rsp as (
  select  
    T.row
  , T.section
  , T.page
  , PERCENTILE_CONT(0.50) WITHIN GROUP (ORDER BY T.delivered) AS median_delivered_per_paying_user
  , avg(T.delivered) as avg_delivered_per_paying_user
  , min(T.delivered) as abs_min_delivered_per_paying_user
  , max(T.delivered) as abs_max_delivered_per_paying_user
  
  , count(*) as total_users
  
  , sum(CASE WHEN T.count_of_transactions_for_a_paying_user > 0 then 1 else 0 end) as paying_users

  , avg(T.avg_tariff_per_paying_user) as avg_tariff_per_paying_user
  , avg(T.count_of_transactions_for_a_paying_user) as avg_count_of_transactions_for_a_paying_user
  -- , avg(T.count_of_transactions_for_a_paying_user_older_than_one_day) as avg_count_of_transactions_for_a_paying_user_older_than_one_day

  , sum(T.transactions) as total_transactions
  , sum(T.delivered) as total_delivered 
  , sum(T.pending) as total_pending 
  , sum(T.failed) as total_failed
  , sum(T.refunded) as total_refunded 
  
  , sum(CASE WHEN
        t.first_transaction_was_delivered = 0 AND T.delivered > 0 THEN 1 ELSE 0 END
    ) as count_of_paying_users_whose_first_transaction_failed

  , sum(T.transactions_pending_for_longer_then_one_day) as transactions_pending_for_longer_then_one_day
  
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
  -- , avg(T.count_of_transactions_for_a_paying_user_older_than_one_day) as avg_count_of_transactions_for_a_paying_user_older_than_one_day
  
  , sum(T.transactions_pending_for_longer_then_one_day) as transactions_pending_for_longer_then_one_day

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
  -- , avg(T.count_of_transactions_for_a_paying_user_older_than_one_day) as avg_count_of_transactions_for_a_paying_user_older_than_one_day

  , sum(T.transactions_pending_for_longer_then_one_day) as transactions_pending_for_longer_then_one_day

  from T
  group by T.page, T.section

)

select B_rsp.* 
, B_p.avg_delivered_per_paying_user as avg_delivered_per_paying_user_at_page_level
, B_p.median_delivered_per_paying_user as median_delivered_per_paying_user_at_page_level
, B_p.avg_tariff_per_paying_user as avg_tariff_per_paying_user_at_page_level
, B_p.avg_count_of_transactions_for_a_paying_user as count_of_transactions_for_a_paying_user_at_page_level
-- , B_p.avg_count_of_transactions_for_a_paying_user_older_than_one_day as avg_count_of_transactions_for_a_paying_user_older_than_one_day_at_page_level
, B_p.transactions_pending_for_longer_then_one_day as transactions_pending_for_longer_then_one_day_at_page_level

, B_ps.avg_delivered_per_paying_user as avg_delivered_per_paying_user_at_section_level
, B_ps.median_delivered_per_paying_user as median_delivered_per_paying_user_at_section_level
, B_ps.avg_tariff_per_paying_user as avg_tariff_per_paying_user_at_section_level
, B_ps.avg_count_of_transactions_for_a_paying_user as count_of_transactions_for_a_paying_user_at_section_level
-- , B_ps.avg_count_of_transactions_for_a_paying_user_older_than_one_day as avg_count_of_transactions_for_a_paying_user_older_than_one_day_at_section_level
, B_ps.transactions_pending_for_longer_then_one_day as transactions_pending_for_longer_then_one_day_at_section_level

from B_rsp
left join B_p on B_rsp.page = B_p.page
left join B_ps on B_rsp.page = B_ps.page and B_rsp.section = B_ps.section
order by page, section, row
