-- homam

with Days as(
  with Days as (
    with Days as (select generate_series(
        date_trunc('week', date '$from_date$')
      , date_trunc('week', date '$to_date$')
      , '1 week'
    ) as day)

    select day as sow, (day + interval '1 week') as eow from Days
  )

  select d.sow as sale_window_start, d.eow as sale_window_end
    , a.sow as revenue_window_start, d.eow as revenue_window_end
    , date_part('day', a.sow - d.sow) as day_after_subscription
    , EXTRACT('week' from d.sow) as sale_week_of_year
    , EXTRACT('week' from a.sow) as revenue_week_of_year
  from Days d
  join Days a on true -- a.sow >= d.sow
  where
    date_part('day', a.sow - d.sow) in (7, 14, 28, 63, 91, 119, 154, 182)

)

, Daily_Data as (
  select * from Days d
  join lateral (
    select
      r.country_code
    , SUM(r.sale_count) as sale_count
    , SUM(r.home_cpa) as cost
    , SUM(r.firstbilling_count) as firstbilling_count
    , SUM(r.optout_24h) as optout_24h
    , SUM(case
          when d.day_after_subscription = 7   then r.tb_first_week_revenue
          when d.day_after_subscription = 14  then r.tb_second_week_revenue + r.tb_first_week_revenue
          when d.day_after_subscription = 28  then r.tb_first_month_revenue
          when d.day_after_subscription = 63  then r.tb_first_month_revenue + r.tb_second_month_revenue
          when d.day_after_subscription = 91  then r.tb_three_month_revenue
          when d.day_after_subscription = 119 then r.tb_three_month_revenue + r.tb_4th_month_revenue
          when d.day_after_subscription = 154 then r.tb_three_month_revenue + r.tb_4th_month_revenue + r.tb_5th_month_revenue
          when d.day_after_subscription = 182 then r.tb_three_month_revenue + r.tb_4th_month_revenue + r.tb_5th_month_revenue + r.tb_6th_month_revenue
          else 0
        end) as revenue
    from reports_ams.rps r
    where r.day >= d.sale_window_start
      and r.day < d.sale_window_end
      and d.day_after_subscription > 0
      and $[(x => !x ? 'true' : R.compose(R.join(' and '), R.map(([k, v])=> `r.${k}='${v}'`), R.splitEvery(2), R.split(','))(x))(params.filter)]$
    group by
        r.country_code
  ) r on true

  order by r.country_code, d.day_after_subscription
)

select
    d.country_code
  , date_trunc('week', d.sale_window_start) as sale_window_start
  , d.day_after_subscription
  , SUM(d.sale_count) :: int as sale_count
  , SUM(d.cost) :: float as cost
  , SUM(d.revenue) :: float as revenue
  , SUM(d.firstbilling_count) :: int as firstbilling_count
  , SUM(d.optout_24h) :: int as optout_24h
  , stddev_pop(d.revenue / d.sale_count) :: float as arpu_stddev
  , stddev_pop(d.firstbilling_count / d.sale_count) :: float as cq_stddev
  , stddev_pop(d.sale_count) :: float as sale_stddev
  from Daily_Data d
  group by
      d.country_code
    , d.day_after_subscription
    , date_trunc('week', d.sale_window_start)
  order by d.country_code, d.day_after_subscription
