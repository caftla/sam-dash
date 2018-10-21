WITH C as (
  SELECT 
      date_trunc('month', r.timestamp) :: timestamp AT TIME ZONE 0 as d_month
    , $[params.f_page('r', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as page
    , $[params.f_section('r', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as section
    , sum(r.home_cpa :: float) as cost
    , count(*) as sales
    , sum(case when r.firstbilling then 1 else 0 end) as firstbillings
    , sum(coalesce(r.tb_revenue, 0)) as tb_revenue
    , sum(coalesce(r.resubscribe, 0)) as resubscribes
    
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 7   then r.tb_first_week_revenue else 0 end) :: float as revenue_week_1
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 14  then r.tb_first_week_revenue + r.tb_second_week_revenue else 0 end) :: float as revenue_week_2
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 30  then r.tb_first_month_revenue else 0 end) :: float as revenue_month_1
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 61  then r.tb_first_month_revenue + r.tb_second_month_revenue else 0 end) :: float as revenue_month_2
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 92  then r.tb_three_month_revenue else 0 end) :: float as revenue_month_3
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 122 then r.tb_three_month_revenue + r.tb_4th_month_revenue else 0 end) :: float as revenue_month_4
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 153 then r.tb_three_month_revenue + r.tb_4th_month_revenue + r.tb_5th_month_revenue else 0 end) :: float as revenue_month_5
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 183 then r.tb_three_month_revenue + r.tb_4th_month_revenue + r.tb_5th_month_revenue  + r.tb_6th_month_revenue else 0 end) :: float as revenue_month_6
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 214 then r.tb_three_month_revenue + r.tb_4th_month_revenue + r.tb_5th_month_revenue  + r.tb_6th_month_revenue  + r.tb_7th_month_revenue else 0 end) :: float as revenue_month_7
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 244 then r.tb_three_month_revenue + r.tb_4th_month_revenue + r.tb_5th_month_revenue  + r.tb_6th_month_revenue  + r.tb_7th_month_revenue + r.tb_8th_month_revenue else 0 end) :: float as revenue_month_8
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 274 then r.tb_three_month_revenue + r.tb_4th_month_revenue + r.tb_5th_month_revenue  + r.tb_6th_month_revenue  + r.tb_7th_month_revenue + r.tb_8th_month_revenue  + tb_9th_month_revenue else 0 end) :: float as revenue_month_9
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 305 then r.tb_three_month_revenue + r.tb_4th_month_revenue + r.tb_5th_month_revenue  + r.tb_6th_month_revenue  + r.tb_7th_month_revenue + r.tb_8th_month_revenue  + r.tb_9th_month_revenue  + r.tb_10th_month_revenue else 0 end) :: float as revenue_month_10
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 335 then r.tb_three_month_revenue + r.tb_4th_month_revenue + r.tb_5th_month_revenue  + r.tb_6th_month_revenue  + r.tb_7th_month_revenue + r.tb_8th_month_revenue + r.tb_9th_month_revenue  + r.tb_10th_month_revenue + r.tb_11th_month_revenue else 0 end) :: float as revenue_month_11
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 365 then r.tb_three_month_revenue + r.tb_4th_month_revenue + r.tb_5th_month_revenue  + r.tb_6th_month_revenue  + r.tb_7th_month_revenue + r.tb_8th_month_revenue + r.tb_9th_month_revenue + r.tb_10th_month_revenue + r.tb_11th_month_revenue + r.tb_12th_month_revenue else 0 end) :: float as revenue_month_12
    
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 7   then 1 else null end) :: float as sales_week_1
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 14  then 1 else null end) :: float as sales_week_2
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 30  then 1 else null end) :: float as sales_month_1
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 61  then 1 else null end) :: float as sales_month_2
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 92  then 1 else null end) :: float as sales_month_3
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 122 then 1 else null end) :: float as sales_month_4
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 153 then 1 else null end) :: float as sales_month_5
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 183 then 1 else null end) :: float as sales_month_6
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 214 then 1 else null end) :: float as sales_month_7
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 244 then 1 else null end) :: float as sales_month_8
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 274 then 1 else null end) :: float as sales_month_9
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 305 then 1 else null end) :: float as sales_month_10
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 335 then 1 else null end) :: float as sales_month_11
    , sum(case when r.sale > 0 and date_diff('days', r.sale_timestamp, current_date) >= 365 then 1 else null end) :: float as sales_month_12
  FROM user_subscriptions r
  WHERE
        r."timestamp" >= $[params.from_date_tz]$ 
    and r."timestamp" < $[params.to_date_tz]$ 
    and $[params.f_filter('r', {fieldMap: {'publisher_id': 'pubid'}})]$
  group by page, section, d_month
  order by page, section, d_month
),

R as (
  SELECT 
      date_trunc('month', r.timestamp) :: timestamp AT TIME ZONE 0 as d_month
    , $[params.f_page('r', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as page
    , $[params.f_section('r', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as section
    , sum(r.revenue :: float) as revenue
  FROM revenue r
  WHERE
        r."timestamp" >= $[params.from_date_tz]$ 
    and r."timestamp" < $[params.to_date_tz]$ 
    and $[params.f_filter('r', {fieldMap: {'publisher_id': 'pubid'}})]$
  group by page, section, d_month
  order by page, section, d_month
), 

O as (
SELECT 
      date_trunc('month', r.optout_timestamp) :: timestamp AT TIME ZONE 0 as d_month
    , $[params.f_page('r', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as page
    , $[params.f_section('r', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as section
    , sum(case when r.optout then 1 else 0 end) as optouts
  FROM user_subscriptions r
  WHERE
        r."optout_timestamp" >= $[params.from_date_tz]$ 
    and r."optout_timestamp" < $[params.to_date_tz]$ -- and r.section = 'IQ'
    and $[params.f_filter('r', {fieldMap: {'publisher_id': 'pubid'}})]$
  group by page, section, d_month
  order by page, section, d_month

),

T as (
  select 
      coalesce(R.page, C.page, O.page) as page
    , coalesce(R.section, C.section, O.section) as section
    , coalesce(R.d_month, C.d_month, O.d_month) as d_month
    , R.revenue
    , C.cost
    , C.sales
    , C.resubscribes
    , C.firstbillings
    , C.tb_revenue
    , O.optouts 
    , C.revenue_week_1
    , C.revenue_week_2
    , C.revenue_month_1
    , C.revenue_month_2
    , C.revenue_month_3
    , C.revenue_month_4
    , C.revenue_month_5
    , C.revenue_month_6
    , C.revenue_month_7
    , C.revenue_month_8
    , C.revenue_month_9
    , C.revenue_month_10
    , C.revenue_month_11
    , C.revenue_month_12
    , C.sales_week_1
    , C.sales_week_2
    , C.sales_month_1
    , C.sales_month_2
    , C.sales_month_3
    , C.sales_month_4
    , C.sales_month_5
    , C.sales_month_6
    , C.sales_month_7
    , C.sales_month_8
    , C.sales_month_9
    , C.sales_month_10
    , C.sales_month_11
    , C.sales_month_12
  from C 
  Full outer join R on C.d_month = R.d_month and C.section = R.section and C.page = R.page
  Full outer join O on O.d_month = R.d_month and O.section = R.section and O.page = R.page
  where (R.revenue > 0 or C.cost > 0)
)

select
    T.d_month
  , T.page
  , T.section
  , coalesce(T.revenue, 0) as revenue
  , coalesce(T.cost, 0) as cost
  , coalesce(T.sales, 0) as sales
  , coalesce(T.resubscribes, 0) as resubscribes
  , coalesce(T.firstbillings, 0) as firstbillings
  , coalesce(T.optouts, 0) as optouts
  , coalesce(T.tb_revenue, 0) as tb_revenue
  
  , coalesce(T.revenue_week_1, 0)   as revenue_week_1
  , coalesce(T.revenue_week_2, 0)   as revenue_week_2
  , coalesce(T.revenue_month_1, 0)  as revenue_month_1
  , coalesce(T.revenue_month_2, 0)  as revenue_month_2
  , coalesce(T.revenue_month_3, 0)  as revenue_month_3
  , coalesce(T.revenue_month_4, 0)  as revenue_month_4
  , coalesce(T.revenue_month_5, 0)  as revenue_month_5
  , coalesce(T.revenue_month_6, 0)  as revenue_month_6
  , coalesce(T.revenue_month_7, 0)  as revenue_month_7
  , coalesce(T.revenue_month_8, 0)  as revenue_month_8
  , coalesce(T.revenue_month_9, 0)  as revenue_month_9
  , coalesce(T.revenue_month_10, 0) as revenue_month_10
  , coalesce(T.revenue_month_11, 0) as revenue_month_11
  , coalesce(T.revenue_month_12, 0) as revenue_month_12
  
  , coalesce(T.sales_week_1, 0)   as sales_week_1
  , coalesce(T.sales_week_2, 0)   as sales_week_2
  , coalesce(T.sales_month_1, 0)  as sales_month_1
  , coalesce(T.sales_month_2, 0)  as sales_month_2
  , coalesce(T.sales_month_3, 0)  as sales_month_3
  , coalesce(T.sales_month_4, 0)  as sales_month_4
  , coalesce(T.sales_month_5, 0)  as sales_month_5
  , coalesce(T.sales_month_6, 0)  as sales_month_6
  , coalesce(T.sales_month_7, 0)  as sales_month_7
  , coalesce(T.sales_month_8, 0)  as sales_month_8
  , coalesce(T.sales_month_9, 0)  as sales_month_9
  , coalesce(T.sales_month_10, 0) as sales_month_10
  , coalesce(T.sales_month_11, 0) as sales_month_11
  , coalesce(T.sales_month_12, 0) as  sales_month_12
from T
order by page, section, d_month
