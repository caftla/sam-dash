CREATE OR REPLACE FUNCTION pg_temp.after(a timestamp, b integer, c numeric) RETURNS numeric AS $$
  BEGIN
    RETURN CASE WHEN EXTRACT(day from now() - a) > b THEN c ELSE null END;
  END;
$$ LANGUAGE plpgsql
IMMUTABLE
RETURNS NULL ON NULL INPUT;

select
    $[params.f_page('d', 'day', {no_timezone: true})]$ as page
  , $[params.f_section('d', 'day', {no_timezone: true})]$ as section
  , $[params.f_row('d', 'day', {no_timezone: true})]$ as row
  , sum(d.home_cpa) :: int as cost
  , sum(d.sale_count) :: int as sales
  , sum(d.sale_pixel_delayed_count + d.sale_pixel_direct_count) :: int as pixels
  , sum(d.optout_24h) :: int as optout_24h
  , sum(d.firstbilling_count) :: int as firstbillings

  , SUM(pg_temp.after(d.day, 7, d.tb_first_week_revenue)) :: float as revenue_week_1
  , SUM(pg_temp.after(d.day, 7, d.sale_count)) :: float as sales_week_1

  , SUM(pg_temp.after(d.day, 14, d.tb_first_week_revenue + d.tb_second_week_revenue)) :: float as revenue_week_2
  , SUM(pg_temp.after(d.day, 14, d.sale_count)) :: float as sales_week_2
  
  , SUM(pg_temp.after(d.day, 30, d.tb_first_month_revenue)) :: float as revenue_month_1
  , SUM(pg_temp.after(d.day, 30, d.sale_count)) :: float as sales_month_1
  
  , SUM(pg_temp.after(d.day, 61, d.tb_first_month_revenue + d.tb_second_month_revenue)) :: float as revenue_month_2
  , SUM(pg_temp.after(d.day, 61, d.sale_count)) :: float as sales_month_2
  
  , SUM(pg_temp.after(d.day, 91, d.tb_three_month_revenue)) :: float as revenue_month_3
  , SUM(pg_temp.after(d.day, 91, d.sale_count)) :: float as sales_month_3
  
  , SUM(pg_temp.after(d.day, 122, d.tb_three_month_revenue + d.tb_4th_month_revenue)) :: float as revenue_month_4
  , SUM(pg_temp.after(d.day, 122, d.sale_count)) :: float as sales_month_4
  
  , SUM(pg_temp.after(d.day, 152, d.tb_three_month_revenue + d.tb_4th_month_revenue + d.tb_5th_month_revenue)) :: float as revenue_month_5
  , SUM(pg_temp.after(d.day, 152, d.sale_count)) :: float as sales_month_5
  
  , SUM(pg_temp.after(d.day, 183, d.tb_three_month_revenue + d.tb_4th_month_revenue + d.tb_5th_month_revenue + d.tb_6th_month_revenue)) :: float as revenue_month_6
  , SUM(pg_temp.after(d.day, 183, d.sale_count)) :: float as sales_month_6
  
  , SUM(pg_temp.after(d.day, 214, d.tb_three_month_revenue + d.tb_4th_month_revenue + d.tb_5th_month_revenue + d.tb_6th_month_revenue + d.tb_7th_month_revenue)) :: float as revenue_month_7
  , SUM(pg_temp.after(d.day, 214, d.sale_count)) :: float as sales_month_7
  
  , SUM(pg_temp.after(d.day, 244, d.tb_three_month_revenue + d.tb_4th_month_revenue + d.tb_5th_month_revenue + d.tb_6th_month_revenue + d.tb_7th_month_revenue + d.tb_8th_month_revenue)) :: float as revenue_month_8
  , SUM(pg_temp.after(d.day, 244, d.sale_count)) :: float as sales_month_8
  
  , SUM(pg_temp.after(d.day, 274, d.tb_three_month_revenue + d.tb_4th_month_revenue + d.tb_5th_month_revenue + d.tb_6th_month_revenue + d.tb_7th_month_revenue + d.tb_8th_month_revenue + d.tb_9th_month_revenue)) :: float as revenue_month_9
  , SUM(pg_temp.after(d.day, 274, d.sale_count)) :: float as sales_month_9
  
  , SUM(pg_temp.after(d.day, 305, d.tb_three_month_revenue + d.tb_4th_month_revenue + d.tb_5th_month_revenue + d.tb_6th_month_revenue + d.tb_7th_month_revenue + d.tb_8th_month_revenue + d.tb_9th_month_revenue + d.tb_10th_month_revenue)) :: float as revenue_month_10
  , SUM(pg_temp.after(d.day, 305, d.sale_count)) :: float as sales_month_10
  
  , SUM(pg_temp.after(d.day, 335, d.tb_three_month_revenue + d.tb_4th_month_revenue + d.tb_5th_month_revenue + d.tb_6th_month_revenue + d.tb_7th_month_revenue + d.tb_8th_month_revenue + d.tb_9th_month_revenue + d.tb_10th_month_revenue + d.tb_11th_month_revenue)) :: float as revenue_month_11
  , SUM(pg_temp.after(d.day, 335, d.sale_count)) :: float as sales_month_11
  
  , SUM(pg_temp.after(d.day, 365, d.tb_three_month_revenue + d.tb_4th_month_revenue + d.tb_5th_month_revenue + d.tb_6th_month_revenue + d.tb_7th_month_revenue + d.tb_8th_month_revenue + d.tb_9th_month_revenue + d.tb_10th_month_revenue + d.tb_11th_month_revenue + d.tb_12th_month_revenue)) :: float as revenue_month_12
  , SUM(pg_temp.after(d.day, 365, d.sale_count)) :: float as sales_month_12

from reports_ams.rps_full d
where d.day >= '$from_date$'
  and d.day < '$to_date$'
  and $[params.f_filter('d')]$
group by page, section, row
order by page, section, row