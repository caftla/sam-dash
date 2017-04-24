-- filter : copuntry_code
-- section: operator_code
-- rows   : date

WITH Affiliates as (

  WITH Conv as (
    select
        $[params.page    == 'day' ? 'c.date_tz' : `coalesce(c.${params.page},    'Unknown')`]$ as page
      , $[params.section == 'day' ? 'c.date_tz' : `coalesce(c.${params.section}, 'Unknown')`]$ as section
      , $[params.row     == 'day' ? 'c.date_tz' : `coalesce(c.${params.row},     'Unknown')`]$ as row
      , SUM(c.sale) as sales
      , SUM(c.lead) as leads
      , SUM(c.view) as views
      , (SUM(c.sale_pixel_direct) + SUM(c.sale_pixel_delayed)) as pixels
      , safediv(SUM(c.sale_pixel_direct) + SUM(c.sale_pixel_delayed), SUM(c.sale)) as pixels_ratio
      , safediv(SUM(c.sale), SUM(c.view)) as cr
    from reports_ams.conversion_daily c
    where c.date_tz >= to_date('$from_date$', 'YYYY-MM-DD') and c.date_tz <= to_date('$to_date$', 'YYYY-MM-DD')
      and $[(x => !x ? 'true' : R.compose(R.join(' and '), R.map(([k, v])=> `c.${k}='${v}'`), R.splitEvery(2), R.split(','))(x))(params.filter)]$
    group by page, section, row
    order by page, section, row
  )
  , RPS as (
    select
        $[params.page    == 'day' ? 'r.day' : `coalesce(r.${params.page},    'Unknown')`]$ as page
      , $[params.section == 'day' ? 'r.day' : `coalesce(r.${params.section}, 'Unknown')`]$ as section
      , $[params.row     == 'day' ? 'r.day' : `coalesce(r.${params.row},     'Unknown')`]$ as row
      , SUM(r.home_cpa) as cost
      , SUM(r.sale_count) as sales
      , SUM(r.optout_48h) as optout_48h
      , SUM(r.firstbilling_count) as firstbillings
      , safediv(SUM(r.home_cpa), SUM(r.sale_count)) as ecpa
      , safediv(SUM(r.firstbilling_count), SUM(r.sale_count)) as cq
      , safediv(SUM(r.sale_count) - SUM(r.optout_24h), SUM(r.sale_count)) as active24
      , SUM(r.optout_24h) as optout_24h
    from reports_ams.rps r
    where r.day >= to_date('$from_date$', 'YYYY-MM-DD') and r.day <= to_date('$to_date$', 'YYYY-MM-DD')
      and $[(x => !x ? 'true' : R.compose(R.join(' and '), R.map(([k, v])=> `r.${k}='${v}'`), R.splitEvery(2), R.split(','))(x))(params.filter)]$
    group by page, section, row
    order by page, section, row
  )
  , Page_Summary as (

    select
        $[params.page    == 'day' ? 'c.date_tz' : `coalesce(c.${params.page},    'Unknown')`]$ as page
      , $[params.row     == 'day' ? 'c.date_tz' : `coalesce(c.${params.row},     'Unknown')`]$ as row
      , SUM(c.sale) as sales
    from reports_ams.conversion_daily c
    where c.date_tz >= to_date('$from_date$', 'YYYY-MM-DD') and c.date_tz <= to_date('$to_date$', 'YYYY-MM-DD')
      and $[(x => !x ? 'true' : R.compose(R.join(' and '), R.map(([k, v])=> `c.${k}='${v}'`), R.splitEvery(2), R.split(','))(x))(params.filter)]$
    group by page, row -- , row

  )
  , Final as (

    select c.*
      , s.section_sales
      , safediv(c.sales, s.section_sales) as section_sales_ratio
      , r.cost
      , r.firstbillings
      , r.active24
      , r.optout_24h
      , r.optout_48h
      , r.ecpa
      , r.cq

    from Conv c
    left join lateral (select sum(s.sales) as section_sales from Page_Summary s
      where
            s.page = c.page
        and s.row = c.row
    ) s on true
    full outer join RPS r on
          c.page = r.page
      and c.section = r.section
      and c.row = r.row
    order by c.page, c.section, c.row
  )

  select page as page
    , section as section
    , SUM(c.sales) as sales
    , SUM(c.views)  as views
    , SUM(c.pixels) as pixels
    , SUM(c.cost)  as cost
    , SUM(c.firstbillings) as firstbillings
    , SUM(c.optout_24h) as optout_24h
    , SUM(c.optout_48h) as optout_48h
    , safediv(SUM(c.sales), SUM(c.views)) :: float as cr
    , safediv(SUM(c.pixels), SUM(c.sales)) :: float as pixels_ratio
    , safediv(SUM(c.cost), SUM(c.sales)) :: float as ecpa
    , safediv(SUM(c.firstbillings), SUM(c.sales)) :: float as cq
    , safediv(SUM(c.sales) - SUM(c.optout_24h), SUM(c.sales)) :: float as active24
    , json_agg(json_build_object(
        'page', c.page
      , 'section', c.section
      , 'row', c.row
      , 'cost', (c.cost)
      , 'section_sales_ratio', c.section_sales_ratio
      , 'sales', (c.sales)
      , 'views', (c.views)
      , 'cr', (c.cr)
      , 'pixels_ratio', (c.pixels_ratio)
      , 'ecpa', (c.ecpa)
      , 'cq', (c.cq)
      , 'active24', (c.active24)
      , 'optout_48h', (c.optout_48h)
      , 'firstbillings', (c.firstbillings)
      , 'section_sales', (c.section_sales)
    )) as data
  from Final c
  -- where c.sales > $min_sales$
  group by page, section

)

select to_json(c.page) as page
  , SUM(c.sales) :: int as sales
  , SUM(c.views) :: int as views
  , safediv(SUM(c.sales), SUM(c.views)) :: float as cr
  , safediv(SUM(c.pixels), SUM(c.sales)) :: float as pixels_ratio
  , safediv(SUM(c.cost), SUM(c.sales)) :: float as ecpa
  , safediv(SUM(c.firstbillings), SUM(c.sales)) :: float as cq
  , safediv(SUM(c.sales) - SUM(c.optout_24h), SUM(c.sales)) :: float as active24
  , json_agg(json_build_object(
      'page', c.page
    , 'section', c.section
    , 'cost', (c.cost)
    , 'sales', (c.sales)
    , 'views', (c.views)
    , 'cr', (c.cr)
    , 'pixels_ratio', (c.pixels_ratio)
    , 'ecpa', (c.ecpa)
    , 'cq', (c.cq)
    , 'active24', (c.active24)
    , 'optout_48h', (c.optout_48h)
    , 'firstbillings', (c.firstbillings)
    , 'data', c.data
  )) as data

from Affiliates c
group by page
