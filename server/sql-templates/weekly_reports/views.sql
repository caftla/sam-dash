with Views as (
  select 
    $[params.f_page('e', 'timestamp', {no_timezone: 0})]$ as page
  , $[params.f_section('e', 'timestamp', {no_timezone: 0})]$ as section
  , $[params.f_row('e', 'timestamp', {no_timezone: 0})]$ as row
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

, FirstBillings as (
  
  select page, section, row, count(*) :: int as firstbillings from (
    select 
        $[params.f_page('s', 'timestamp', {no_timezone: 0})]$ as page
      , $[params.f_section('s', 'timestamp', {no_timezone: 0})]$ as section
      , $[params.f_row('s', 'timestamp', {no_timezone: 0})]$ as row
      , b.rockman_id 
    
    from events b
    
    inner join events s on 
          s.rockman_id = b.rockman_id
      and s.timestamp >= $[params.from_date_tz]$
      and s.timestamp < $[params.to_date_tz]$
      and $[params.f_filter('s')]$
      and s.sale
      
    where b.timestamp >= $[params.from_date_tz]$
      and $[params.f_filter('b')]$
      and b.firstbilling

    group by page, section, row, b.rockman_id
    
  ) group by page, section, row

)


, ReSubs as (
  with ReSubs1 as (
    select 
      $[params.f_page('e', 'timestamp', {no_timezone: 0})]$ as page
    , $[params.f_section('e', 'timestamp', {no_timezone: 0})]$ as section
    , $[params.f_row('e', 'timestamp', {no_timezone: 0})]$ as row
    , e.msisdn as msisdn
    from public.events e 
    where e.timestamp >= $[params.from_date_tz]$
      and e.timestamp < $[params.to_date_tz]$
      and $[params.f_filter('e')]$
      and e.sale
    group by page, section, row, msisdn
    order by page, section, row, msisdn
  )
  
  select page, section, row, count(*) :: int as uniquesales from ReSubs1 r 
  group by page, section, row
  order by page, section, row

)

, ReLeads as (
  with ReLeads1 as (
    select 
      $[params.f_page('e', 'timestamp', {no_timezone: 0})]$ as page
    , $[params.f_section('e', 'timestamp', {no_timezone: 0})]$ as section
    , $[params.f_row('e', 'timestamp', {no_timezone: 0})]$ as row
    , e.msisdn as msisdn
    from public.events e 
    where e.timestamp >= $[params.from_date_tz]$
      and e.timestamp < $[params.to_date_tz]$
      and $[params.f_filter('e')]$
      and e.lead
    group by page, section, row, msisdn
    order by page, section, row, msisdn
  )
  
  select page, section, row, count(*) :: int as uniqueleads from ReLeads1 r 
  group by page, section, row
  order by page, section, row

)


, Cost1 as (

  select 
    $[params.f_page('e', 'timestamp', {no_timezone: 0})]$ as page
  , $[params.f_section('e', 'timestamp', {no_timezone: 0})]$ as section
  , $[params.f_row('e', 'timestamp', {no_timezone: 0})]$ as row
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

  select page, section, row, count(*) :: int as optout_24 from (
    select 
        $[params.f_page('s', 'timestamp', {no_timezone: 0})]$ as page
      , $[params.f_section('s', 'timestamp', {no_timezone: 0})]$ as section
      , $[params.f_row('s', 'timestamp', {no_timezone: 0})]$ as row
      , b.rockman_id 
    
    from events b
    
    inner join events s on 
          s.rockman_id = b.rockman_id
      and s.timestamp >= $[params.from_date_tz]$
      and s.timestamp < $[params.to_date_tz]$
      and ((b.timestamp - s.timestamp) <= interval '1 day')
      and $[params.f_filter('s')]$
      and s.sale
      
    where b.timestamp >= $[params.from_date_tz]$
      and $[params.f_filter('b')]$
      and b.optout

    group by page, section, row, b.rockman_id
      
  ) group by page, section, row
)

, Optouts as (

  select page, section, row, count(*) :: int as optouts from (
    select 
        $[params.f_page('s', 'timestamp', {no_timezone: 0})]$ as page
      , $[params.f_section('s', 'timestamp', {no_timezone: 0})]$ as section
      , $[params.f_row('s', 'timestamp', {no_timezone: 0})]$ as row
      , b.rockman_id 
    
    from events b
    
    inner join events s on 
          s.rockman_id = b.rockman_id
      and s.timestamp >= $[params.from_date_tz]$
      and s.timestamp < $[params.to_date_tz]$
      and $[params.f_filter('s')]$
      and s.sale
      
    where b.timestamp >= $[params.from_date_tz]$
      and $[params.f_filter('b')]$
      and b.optout

    group by page, section, row, b.rockman_id

  ) group by page, section, row
)

select v.page, v.section, v.row
, v.views, v.leads, v.sales, v.pixels, v.paid_sales, v.day_optouts
, nvl(f.firstbillings, 0) as firstbillings
, nvl(r.uniquesales, 0) as uniquesales
, nvl(l.uniqueleads, 0) as uniqueleads
, o.optout_24, p.optouts, c.cost, c.home_cpa 
from Views v
left join Optout24 o on v.page = o.page and v.section = o.section and v.row = o.row
left join Cost2 c on v.page = c.page and v.section = c.section and v.row = c.row
left join Optouts p on v.page = p.page and v.section = p.section and v.row = p.row
left join ReSubs r on v.page = r.page and v.section = r.section and v.row = r.row
left join ReLeads l on v.page = l.page and v.section = l.section and v.row = l.row
left join FirstBillings f on v.page = f.page and v.section = f.section and v.row = f.row
order by v.page, v.section, v.row    
