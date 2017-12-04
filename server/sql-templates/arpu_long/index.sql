select  
    $[params.f_page('us', 'sale_timestamp', {no_timezone: true})]$ as page
  , $[params.f_section('us', 'sale_timestamp', {no_timezone: true})]$ as section
  , $[params.f_row('us', 'sale_timestamp', {no_timezone: true})]$ as row
  , sum(case when us.sale > 0 then 1 else 0 end) :: float as sales
  , sum(case when us.pixel > 0 then 1 else 0 end) :: float as pixels
  , sum(case when us.firstbilling > 0 then 1 else 0 end) :: float as firstbillings
  , sum(us.home_cpa) :: float as cost
  , sum(case when us.optout > 0 then 1 else 0 end) :: float as optouts
  , sum(case when us.optout > 0 and date_diff('hours', us.sale_timestamp, us.optout_timestamp) < 24 then 1 else 0 end) :: float as optout_24h
  
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
  
  
  -- , avg(       case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 7   then us.tb_first_week_revenue                               else null end) as arpu_week_1
  -- , avg(       case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 14  then us.tb_first_week_revenue + us.tb_second_week_revenue   else null end) as arpu_week_2
  -- , avg(       case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 30  then us.tb_first_month_revenue                              else null end) as arpu_month_1
  -- , avg(       case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 61  then us.tb_first_month_revenue + us.tb_second_month_revenue else null end) as arpu_month_2
  -- , avg(       case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 92  then us.tb_three_month_revenue                              else null end) as arpu_month_3
  -- , avg(       case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 122 then us.tb_three_month_revenue + us.tb_4th_month_revenue    else null end) as arpu_month_4
  -- , avg(       case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 153 then us.tb_three_month_revenue + us.tb_4th_month_revenue 
  --                                                                                                                                 + us.tb_5th_month_revenue    else null end) as arpu_month_5
  -- , avg(       case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 183 then us.tb_three_month_revenue + us.tb_4th_month_revenue 
  --                                                                                                       + us.tb_5th_month_revenue + us.tb_6th_month_revenue    else null end) as arpu_month_6
  
  , stddev_pop(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 7   then us.tb_first_week_revenue                               else null end) as arpu_stddev_7
  , stddev_pop(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 14  then us.tb_first_week_revenue + us.tb_second_week_revenue   else null end) as arpu_stddev_14
  , stddev_pop(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 30  then us.tb_first_month_revenue                              else null end) as arpu_stddev_30
  , stddev_pop(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 61  then us.tb_first_month_revenue + us.tb_second_month_revenue else null end) as arpu_stddev_61
  , stddev_pop(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 92  then us.tb_three_month_revenue                              else null end) as arpu_stddev_92
  , stddev_pop(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 122 then us.tb_three_month_revenue + us.tb_4th_month_revenue    else null end) as arpu_stddev_122
  , stddev_pop(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 153 then us.tb_three_month_revenue + us.tb_4th_month_revenue 
                                                                                                                                  + us.tb_5th_month_revenue    else null end) as arpu_stddev_153
  , stddev_pop(case when us.sale > 0 and date_diff('days', us.sale_timestamp, current_date) >= 183 then us.tb_three_month_revenue + us.tb_4th_month_revenue 
                                                                                                        + us.tb_5th_month_revenue + us.tb_6th_month_revenue    else null end) as arpu_stddev_183
  
from user_subscriptions us
where us.sale_timestamp >= '$from_date$'
  and us.sale_timestamp < '$to_date$'
  and $[params.f_filter('us')]$
group by page, section, row
order by page, section, row