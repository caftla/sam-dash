with Views as (
  select 
    e.ip3 as ip3
  , sum(case when e.impression > 0 or e.redirect > 0 then 1 else 0 end) :: int as views
  from public.user_sessions e
  where e.timestamp >= '$from_date$'
    and e.timestamp <= '$to_date$'
    and $[params.f_filter('e')]$
    and (e.impression > 0 or e.redirect > 0)
  group by ip3
), Sales as (
  select 
    e.ip3 as ip3
  , e.operator_code as operator_code
  , sum(case when e.pixel > 0 or e.delayed_pixel > 0 then 1 else 0 end) :: int as pixels
  , sum(case when e.sale > 0 then 1 else 0 end) :: int as sales
  , sum(case when e.firstbilling then 1 else 0 end) :: int as firstbillings
  , sum(e.home_cpa) :: float as cost
  from public.user_subscriptions e
  where e.timestamp >= '$from_date$'
    and e.timestamp <= '$to_date$'
    and $[params.f_filter('e')]$
    and e.impression > 0
  group by ip3, operator_code
)

select v.ip3, v.views, s.operator_code, s.pixels, s.sales, s.firstbillings, s.cost from Views v
left join Sales s on V.ip3 = s.ip3

