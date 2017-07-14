with Views as (
  select 
    $[params.f_page('e', 'timestamp')]$ as page
  , $[params.f_section('e', 'timestamp')]$ as section
  , $[params.f_row('e', 'timestamp')]$ as row
  , sum(case when e.view then 1 else 0 end) :: int as views
  , sum(case when e.lead then 1 else 0 end) :: int as leads
  , sum(case when e.sale then 1 else 0 end) :: int as sales
  , sum(case when e.sale_pixel_direct or e.sale_pixel_delayed then 1 else 0 end) :: int as pixels
  , sum(case when(e.sale_pixel_direct or e.sale_pixel_delayed) and (e.scrub is not true) then 1 else 0 end) :: int as paid_sales
  , sum(case when e.firstbilling then 1 else 0 end) :: int as firstbillings
  , sum(case when e.optout then 1 else 0 end) :: int as day_optouts
  from public.events e 
  where e.timestamp >= $[params.from_date_tz]$
    and e.timestamp < $[params.to_date_tz]$
    and $[params.f_filter('e')]$
  group by page, section, row
  order by page, section, row
)

, Cost1 as (

  select 
    $[params.f_page('e', 'timestamp')]$ as page
  , $[params.f_section('e', 'timestamp')]$ as section
  , $[params.f_row('e', 'timestamp')]$ as row
  , e.cpa_id
  , sum(case when(e.sale_pixel_direct or e.sale_pixel_delayed) and (e.scrub is not true) then 1 else 0 end) :: int as paid_sales
  from public.events e 
  where e.timestamp >= $[params.from_date_tz]$
    and e.timestamp < $[params.to_date_tz]$
    and $[params.f_filter('e')]$
  group by page, section, row, e.cpa_id
  order by page, section, row, e.cpa_id
)

, Cost2 as (

  select 
    page, section, row
  , sum(nvl(c.home_cpa, 0) * c1.paid_sales) :: float as cost
  , (case when sum(c1.paid_sales) = 0 then 0 else sum(nvl(c.home_cpa, 0) * c1.paid_sales) / sum(c1.paid_sales) end) :: float as home_cpa 
  from Cost1 as c1
  left join cpa c on c.cpa_id = c1.cpa_id
  group by page, section, row
)

, Optout24 as (

  select 
    $[params.f_page('e', 'timestamp')]$ as page
  , $[params.f_section('e', 'timestamp')]$ as section
  , $[params.f_row('e', 'timestamp')]$ as row
  , sum(case when e.optout and e.active_duration is not null and e.active_duration <= 86400 then 1 else 0 end) :: int as optout_24
  from events e
  where e.timestamp >= $[params.from_date_tz]$
    and e.timestamp < dateadd(day, 1, $[params.to_date_tz]$)
    and $[params.f_filter('e')]$
  group by page, section, row
  order by page, section, row
)

, Optouts as (

  select 
    $[params.f_page('e', 'timestamp')]$ as page
  , $[params.f_section('e', 'timestamp')]$ as section
  , $[params.f_row('e', 'timestamp')]$ as row
  , sum(case when e.optout then 1 else 0 end) :: int as optouts
  from events e
  where e.start_timestamp >= $[params.from_date_tz]$
    and e.start_timestamp < $[params.to_date_tz]$
    and e.timestamp >= $[params.from_date_tz]$
    and $[params.f_filter('e')]$
  group by page, section, row
  order by page, section, row
)

select v.*, o.optout_24, p.optouts, c.cost, c.home_cpa from Views v
left join Optout24 o on v.page = o.page and v.section = o.section and v.row = o.row
left join Cost2 c on v.page = c.page and v.section = c.section and v.row = c.row
left join Optouts p on v.page = p.page and v.section = p.section and v.row = p.row

order by v.page, v.section, v.row
-- left join cpa c on c.cpa_id = v.cpa_id