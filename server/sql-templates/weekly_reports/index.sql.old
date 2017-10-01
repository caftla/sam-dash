with rock as (
  select * from dblink('rockman_redshift'::text, '

    with Views as (
      select 
        $[params.f_page('e', 'timestamp', {no_timezone: 0, double_quote: true})]$ as page
      , $[params.f_section('e', 'timestamp', {no_timezone: 0, double_quote: true})]$ as section
      , $[params.f_row('e', 'timestamp', {no_timezone: 0, double_quote: true})]$ as row
      , sum(case when e.view then 1 else 0 end) :: int as views
      , sum(case when e.lead then 1 else 0 end) :: int as leads
      , sum(case when e.sale then 1 else 0 end) :: int as sales
      , sum(case when e.sale_pixel_direct or e.sale_pixel_delayed then 1 else 0 end) :: int as pixels
      , sum(case when(e.sale_pixel_direct or e.sale_pixel_delayed) and (e.scrub is not true) then 1 else 0 end) :: int as paid_sales
      , sum(case when e.firstbilling then 1 else 0 end) :: int as firstbillings
      , sum(case when e.optout then 1 else 0 end) :: int as day_optouts
      from public.events e 
      where e.timestamp >= $[params.from_date_tz_double_quote]$
        and e.timestamp < $[params.to_date_tz_double_quote]$
        and $[params.f_filter('e', { double_quote: true })]$
      group by page, section, row
      order by page, section, row
    )

    , FirstBillings as (
      
      select page, section, row, count(*) :: int as firstbillings from (
        select 
            $[params.f_page('s', 'timestamp', {no_timezone: 0, double_quote: true})]$ as page
          , $[params.f_section('s', 'timestamp', {no_timezone: 0, double_quote: true})]$ as section
          , $[params.f_row('s', 'timestamp', {no_timezone: 0, double_quote: true})]$ as row
          , b.rockman_id 
        
        from events b
        
        inner join events s on 
              s.rockman_id = b.rockman_id
          and s.timestamp >= $[params.from_date_tz_double_quote]$
          and s.timestamp < $[params.to_date_tz_double_quote]$
          and $[params.f_filter('s', { double_quote: true })]$
          and s.sale
          
        where b.timestamp >= $[params.from_date_tz_double_quote]$
          and $[params.f_filter('b', { double_quote: true })]$
          and b.firstbilling

        group by page, section, row, b.rockman_id
        
      ) group by page, section, row

    )


    , ReSubs as (
      with ReSubs1 as (
        select 
          $[params.f_page('e', 'timestamp', {no_timezone: 0, double_quote: true})]$ as page
        , $[params.f_section('e', 'timestamp', {no_timezone: 0, double_quote: true})]$ as section
        , $[params.f_row('e', 'timestamp', {no_timezone: 0, double_quote: true})]$ as row
        , e.msisdn as msisdn
        from public.events e 
        where e.timestamp >= $[params.from_date_tz_double_quote]$
          and e.timestamp < $[params.to_date_tz_double_quote]$
          and $[params.f_filter('e', { double_quote: true })]$
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
          $[params.f_page('e', 'timestamp', {no_timezone: 0, double_quote: true})]$ as page
        , $[params.f_section('e', 'timestamp', {no_timezone: 0, double_quote: true})]$ as section
        , $[params.f_row('e', 'timestamp', {no_timezone: 0, double_quote: true})]$ as row
        , e.msisdn as msisdn
        from public.events e 
        where e.timestamp >= $[params.from_date_tz_double_quote]$
          and e.timestamp < $[params.to_date_tz_double_quote]$
          and $[params.f_filter('e', { double_quote: true })]$
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
        $[params.f_page('e', 'timestamp', {no_timezone: 0, double_quote: true})]$ as page
      , $[params.f_section('e', 'timestamp', {no_timezone: 0, double_quote: true})]$ as section
      , $[params.f_row('e', 'timestamp', {no_timezone: 0, double_quote: true})]$ as row
      , e.cpa_id
      , sum(case when(e.sale_pixel_direct or e.sale_pixel_delayed) and (e.scrub is not true) then 1 else 0 end) :: int as paid_sales
      from public.events e 
      where e.timestamp >= $[params.from_date_tz_double_quote]$
        and e.timestamp < $[params.to_date_tz_double_quote]$
        and $[params.f_filter('e', { double_quote: true })]$
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
            $[params.f_page('s', 'timestamp', {no_timezone: 0, double_quote: true})]$ as page
          , $[params.f_section('s', 'timestamp', {no_timezone: 0, double_quote: true})]$ as section
          , $[params.f_row('s', 'timestamp', {no_timezone: 0, double_quote: true})]$ as row
          , b.rockman_id 
        
        from events b
        
        inner join events s on 
              s.rockman_id = b.rockman_id
          and s.timestamp >= $[params.from_date_tz_double_quote]$
          and s.timestamp < $[params.to_date_tz_double_quote]$
          and ((b.timestamp - s.timestamp) <= interval ''1 day'')
          and $[params.f_filter('s', { double_quote: true })]$
          and s.sale
          
        where b.timestamp >= $[params.from_date_tz_double_quote]$
          and $[params.f_filter('b', { double_quote: true })]$
          and b.optout

        group by page, section, row, b.rockman_id
          
      ) group by page, section, row
    )

    , Optouts as (

      select page, section, row, count(*) :: int as optouts from (
        select 
            $[params.f_page('s', 'timestamp', {no_timezone: 0, double_quote: true})]$ as page
          , $[params.f_section('s', 'timestamp', {no_timezone: 0, double_quote: true})]$ as section
          , $[params.f_row('s', 'timestamp', {no_timezone: 0, double_quote: true})]$ as row
          , b.rockman_id 
        
        from events b
        
        inner join events s on 
              s.rockman_id = b.rockman_id
          and s.timestamp >= $[params.from_date_tz_double_quote]$
          and s.timestamp < $[params.to_date_tz_double_quote]$
          and $[params.f_filter('s', { double_quote: true })]$
          and s.sale
          
        where b.timestamp >= $[params.from_date_tz_double_quote]$
          and $[params.f_filter('b', { double_quote: true })]$
          and b.optout

        group by page, section, row, b.rockman_id

      ) group by page, section, row
    )
    
    , Transactions as (

      select 
        $[params.f_page('t', 'timestamp', {no_timezone: 0, double_quote: true})]$ as page
      , $[params.f_section('t', 'timestamp', {no_timezone: 0, double_quote: true})]$ as section
      , $[params.f_row('t', 'timestamp', {no_timezone: 0, double_quote: true})]$ as row
      , sum(case when t.dnstatus = ''Pending'' then 1 else 0 end) :: int as pending 
      , sum(case when t.dnstatus = ''Delivered'' then 1 else 0 end) :: int as delivered
      , sum(case when t.dnstatus = ''Refunded'' then 1 else 0 end) :: int as refunded
      , sum(case when t.dnstatus = ''Failed'' then 1 else 0 end) :: int as failed
      , sum(case when t.dnstatus not in (''Pending'', ''Delivered'', ''Refunded'', ''Failed'') then 1 else 0 end) :: int as unknown 
      , sum(1) :: int as total
      from transactions t
      where t.timestamp >= $[params.from_date_tz_double_quote]$
        and t.timestamp < $[params.to_date_tz_double_quote]$
        and t.tariff > 0
        and $[params.f_filter('t', { double_quote: true })]$
      group by page, section, row
      order by page, section, row
    )

    select v.page, v.section, v.row
    , v.views, v.leads, v.sales, v.pixels, v.paid_sales, v.day_optouts
    , nvl(f.firstbillings, 0) as firstbillings
    , nvl(r.uniquesales, 0) as uniquesales
    , nvl(l.uniqueleads, 0) as uniqueleads
    , o.optout_24, p.optouts, c.cost, c.home_cpa 
    , nvl(t.delivered, 0) as delivered_transactions
    , nvl(t.total, 0) as total_transactions
    from Views v
    left join Optout24 o on v.page = o.page and v.section = o.section and v.row = o.row
    left join Cost2 c on v.page = c.page and v.section = c.section and v.row = c.row
    left join Optouts p on v.page = p.page and v.section = p.section and v.row = p.row
    left join ReSubs r on v.page = r.page and v.section = r.section and v.row = r.row
    left join ReLeads l on v.page = l.page and v.section = l.section and v.row = l.row
    left join FirstBillings f on v.page = f.page and v.section = f.section and v.row = f.row
    left join Transactions t on v.page = t.page and v.section = t.section and v.row = t.row
    order by v.page, v.section, v.row    
  

  ') link (page varchar, section varchar, row timestamptz, views int4, leads int4, sales int4, pixels int4, paid_sales int4, day_optouts int4, firstbillings int4, uniquesales int4, uniqueleads int4, optout_24 int4, optouts int4, cost float8, home_cpa float8, delivered_transactions int4, total_transactions int4)
),

helix as (

select
    $[params.f_page('d', 'day', {no_timezone: true})]$ as page
  , $[params.f_section('d', 'day', {no_timezone: true})]$ as section
  , $[params.f_row('d', 'day', {no_timezone: true})]$ as row
  , sum(d.ptb_revenue) :: int as revenue
  , sum(d.cpa_cost) :: int as cost
  , sum(d.sale_count) :: int as sales
  , sum(d.sale_pixel_delayed_count + d.sale_pixel_direct_count) :: int as pixels
from reports_ams.drt_full d
where d.day >= '$from_date$'
  and d.day < '$to_date$'
  and $[params.f_filter('d')]$
group by page, section, row
order by page, section, row

)

select r.*, h.revenue, h.cost as hcost, h.sales as hsales, h.pixels as hpixels from rock r 
left join helix h
on r.page = h.page and r.section = h.section and r.row = h.row
order by page, section, row
