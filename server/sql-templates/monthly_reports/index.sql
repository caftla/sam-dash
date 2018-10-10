With R as (
  select
      $[params.f_page('d', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as page
    , $[params.f_section('d', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as section
    , extract('year' from date_trunc('month', d.timestamp)) as year_code
    , extract('month' from date_trunc('month', d.timestamp)) as month_code
    , sum(d.revenue) :: int as revenue
  from revenue d
  where d.timestamp >= '$from_date$'
    and d.timestamp < '$to_date$'
    and $[params.f_filter('d', {fieldMap: {'publisher_id': 'pubid'}})]$
  group by page, section, year_code, month_code
  order by page, section, year_code, month_code
)
, O as (

  select
      $[params.f_page('d', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as page
    , $[params.f_section('d', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as section
    , extract('year' from date_trunc('month', d.optout_timestamp)) as year_code
    , extract('month' from date_trunc('month', d.optout_timestamp)) as month_code
    , sum(case when d.optout then 1 else 0 end) as optouts
  from user_sessions d
  where d.optout_timestamp >= '$from_date$'
    and d.optout_timestamp < '$to_date$'
    and $[params.f_filter('d', {fieldMap: {'publisher_id': 'pubid'}})]$
  group by page, section, year_code, month_code
  order by page, section, year_code, month_code

),

A as (
  with T AS (
    select
        $[params.f_page('us', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as page
      , $[params.f_section('us', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as section
      , extract('year' from date_trunc('month', us.sale_timestamp)) as year_code
      , extract('month' from date_trunc('month', us.sale_timestamp)) as month_code
    
      , sum(case when us.sale > 0 then 1 else 0 end) :: float as sales
      , sum(case when us.pixel > 0 or us.delayed_pixel > 0 then 1 else 0 end) :: float as pixels
      , sum(case when us.delayed_pixel > 0 then 1 else 0 end) :: float as delayed_pixels
      , sum(case when us.firstbilling > 0 then 1 else 0 end) :: float as firstbilling_count
      , sum(us.home_cpa) :: float as cost
      , sum(case when us.optout > 0 then 1 else 0 end) :: float as month_optouts
      , sum(case when us.optout > 0 and date_diff('hours', us.sale_timestamp, us.optout_timestamp) < 24 then 1 else 0 end) :: float as optout_24h
      , sum(case when us.resubscribe > 0 then 1 else 0 end) :: float as resubs
    
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 7   then 1 else null end) :: float as sales_week_1
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 14  then 1 else null end) :: float as sales_week_2
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 30  then 1 else null end) :: float as sales_month_1
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 61  then 1 else null end) :: float as sales_month_2
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 92  then 1 else null end) :: float as sales_month_3
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 122 then 1 else null end) :: float as sales_month_4
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 153 then 1 else null end) :: float as sales_month_5
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 183 then 1 else null end) :: float as sales_month_6
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 214 then 1 else null end) :: float as sales_month_7
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 244 then 1 else null end) :: float as sales_month_8
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 274 then 1 else null end) :: float as sales_month_9
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 305 then 1 else null end) :: float as sales_month_10
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 335 then 1 else null end) :: float as sales_month_11
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 365 then 1 else null end) :: float as sales_month_12
    
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 7   then us.tb_first_week_revenue else 0 end) :: float as revenue_week_1
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 14  then us.tb_first_week_revenue + us.tb_second_week_revenue else 0 end) :: float as revenue_week_2
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 30  then us.tb_first_month_revenue else 0 end) :: float as revenue_month_1
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 61  then us.tb_first_month_revenue + us.tb_second_month_revenue else 0 end) :: float as revenue_month_2
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 92  then us.tb_three_month_revenue else 0 end) :: float as revenue_month_3
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 122 then us.tb_three_month_revenue + us.tb_4th_month_revenue else 0 end) :: float as revenue_month_4
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 153 then us.tb_three_month_revenue + us.tb_4th_month_revenue + us.tb_5th_month_revenue else 0 end) :: float as revenue_month_5
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 183 then us.tb_three_month_revenue + us.tb_4th_month_revenue + us.tb_5th_month_revenue  + us.tb_6th_month_revenue else 0 end) :: float as revenue_month_6
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 214 then us.tb_three_month_revenue + us.tb_4th_month_revenue + us.tb_5th_month_revenue  + us.tb_6th_month_revenue  + us.tb_7th_month_revenue else 0 end) :: float as revenue_month_7
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 244 then us.tb_three_month_revenue + us.tb_4th_month_revenue + us.tb_5th_month_revenue  + us.tb_6th_month_revenue  + us.tb_7th_month_revenue + us.tb_8th_month_revenue else 0 end) :: float as revenue_month_8
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 274 then us.tb_three_month_revenue + us.tb_4th_month_revenue + us.tb_5th_month_revenue  + us.tb_6th_month_revenue  + us.tb_7th_month_revenue + us.tb_8th_month_revenue  + tb_9th_month_revenue else 0 end) :: float as revenue_month_9
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 305 then us.tb_three_month_revenue + us.tb_4th_month_revenue + us.tb_5th_month_revenue  + us.tb_6th_month_revenue  + us.tb_7th_month_revenue + us.tb_8th_month_revenue  + us.tb_9th_month_revenue  + us.tb_10th_month_revenue else 0 end) :: float as revenue_month_10
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 335 then us.tb_three_month_revenue + us.tb_4th_month_revenue + us.tb_5th_month_revenue  + us.tb_6th_month_revenue  + us.tb_7th_month_revenue + us.tb_8th_month_revenue + us.tb_9th_month_revenue  + us.tb_10th_month_revenue + us.tb_11th_month_revenue else 0 end) :: float as revenue_month_11
      , sum(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 365 then us.tb_three_month_revenue + us.tb_4th_month_revenue + us.tb_5th_month_revenue  + us.tb_6th_month_revenue  + us.tb_7th_month_revenue + us.tb_8th_month_revenue + us.tb_9th_month_revenue + us.tb_10th_month_revenue + us.tb_11th_month_revenue + tb_12th_month_revenue else 0 end) :: float as revenue_month_12
      
    
    from user_subscriptions us
    where us.sale_timestamp >= '$from_date$'
      and us.sale_timestamp < '$to_date$'
      and $[params.f_filter('us', {fieldMap: {'publisher_id': 'pubid'}})]$
    group by page, section, year_code, month_code
    order by page, section, year_code, month_code
  )
  
  select T.*
      , (revenue_week_1  :: float / NULLIF(sales_week_1 , 0):: float) as arpu_week_1 
      , (revenue_month_1 :: float / NULLIF(sales_month_1, 0) :: float) as arpu_month_1 
      , (revenue_month_2 :: float / NULLIF(sales_month_2, 0) :: float) as arpu_month_2 
      , (revenue_month_3 :: float / NULLIF(sales_month_3, 0) :: float) as arpu_month_3 
  from T


  order by 
      page
    , section
    , year_code
    , month_code

)

, B as (

  SELECT
      page
    , section
    , extract('year' from start_of_month) as year_code
    , extract('month' from start_of_month) as month_code
    , SUM(msg_sent) msg_sent
    , SUM(msg_failed) AS msg_failed
    , SUM(msg_delivered) AS msg_delivered
    , SUM(msg_pending) AS msg_pending
    , SUM(msg_undefined) AS msg_undefined
    , SUM(msg_refunded) AS msg_refunded
  FROM (
    SELECT
        $[params.f_page('t', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as page
      , $[params.f_section('t', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as section
      , date_trunc('month', t.timestamp) as start_of_month
      , COUNT(*) msg_sent
      , SUM((CASE when (dnstatus = 'Failed') THEN 1 ELSE 0 END)) AS msg_failed
      , SUM((CASE when (dnstatus = 'Delivered') THEN 1 ELSE 0 END)) AS msg_delivered
      , SUM((CASE when (dnstatus = 'Pending') THEN 1 ELSE 0 END)) AS msg_pending
      , SUM((CASE when (dnstatus NOT IN ('Failed', 'Delivered', 'Pending', 'Refunded')) THEN 1 ELSE 0 END)) AS msg_undefined
      , SUM((CASE when (dnstatus = 'Refunded') THEN 1 ELSE 0 END)) AS msg_refunded
    FROM
      transactions t
    WHERE
          t.timestamp >= '$from_date$'
      and t.timestamp < '$to_date$'
      AND t.rockman_id IS NOT NULL
      and $[params.f_filter('t', {fieldMap: {'publisher_id': 'pubid'}})]$
    GROUP BY
      page,
      section,
      start_of_month

    UNION ALL

    SELECT
        $[params.f_page('t', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as page
      , $[params.f_section('t', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as section
      , date_trunc('month', t.timestamp) as start_of_month
      , COUNT(*) msg_sent
      , SUM((CASE when (dnstatus = 'Failed') THEN 1 ELSE 0 END)) AS msg_failed
      , SUM((CASE when (dnstatus = 'Delivered') THEN 1 ELSE 0 END)) AS msg_delivered
      , SUM((CASE when (dnstatus = 'Pending') THEN 1 ELSE 0 END)) AS msg_pending
      , SUM((CASE when (dnstatus NOT IN ('Failed', 'Delivered', 'Pending', 'Refunded')) THEN 1 ELSE 0 END)) AS msg_undefined
      , SUM((CASE when (dnstatus = 'Refunded') THEN 1 ELSE 0 END)) AS msg_refunded
    FROM
      dev.transactions_null t
    WHERE
          t.timestamp >= '$from_date$'
      and t.timestamp < '$to_date$'
      and $[params.f_filter('t', {fieldMap: {'publisher_id': 'pubid'}})]$
    GROUP BY
      page,
      section,
      start_of_month
  )
  GROUP BY
    page,
    section,
    year_code,
    month_code

  order by 
      page
    , section
    , year_code
    , month_code

)

, RO as (
  select
        R.revenue
      , O.optouts
      , COALESCE(R.page, O.page) as page
      , COALESCE(R.section, O.section) as section
      , COALESCE(R.year_code, O.year_code) as year_code
      , COALESCE(R.month_code, O.month_code) as month_code
  from R full join O
    on R.page  = O.page
   and R.section = O.section
   and R.year_code     = O.year_code
   and R.month_code    = O.month_code
)
, ROA as (
  select 
      RO.revenue
    , RO.optouts
    , A.arpu_week_1
    , A.arpu_month_1
    , A.arpu_month_2
    , A.arpu_month_3
    , A.sales
    , A.pixels
    , A.firstbilling_count
    , A.cost
    , A.optout_24h
    , A.resubs
    , COALESCE(RO.page, A.page) as page
    , COALESCE(RO.section, A.section) as section
    , COALESCE(RO.year_code, A.year_code) as year_code
    , COALESCE(RO.month_code, A.month_code) as month_code
    
  from RO full join A 
    on RO.page  = A.page
  and RO.section = A.section
  and RO.year_code     = A.year_code
  and RO.month_code    = A.month_code

)   
, ROAB as (

  select 
      ROA.revenue
    , ROA.optouts
    , ROA.arpu_week_1
    , ROA.arpu_month_1
    , ROA.arpu_month_2
    , ROA.arpu_month_3
    , ROA.sales
    , ROA.pixels
    , ROA.firstbilling_count
    , ROA.cost
    , ROA.optout_24h
    , ROA.resubs
    , B.msg_sent
    , B.msg_failed
    , B.msg_delivered
    , B.msg_pending
    , B.msg_undefined
    , B.msg_refunded
    , COALESCE(ROA.page, B.page) as page
    , COALESCE(ROA.section, B.section) as section
    , COALESCE(ROA.year_code, B.year_code) as year_code
    , COALESCE(ROA.month_code, B.month_code) as month_code
    
  from ROA full join B
    on ROA.page = B.page
  and ROA.section = B.section
  and ROA.year_code     = B.year_code
  and ROA.month_code    = B.month_code

  order by  COALESCE(ROA.page, B.page)
          , COALESCE(ROA.section, B.section)
          , COALESCE(ROA.year_code, B.year_code)
          , COALESCE(ROA.month_code, B.month_code)

)

select * from ROAB       