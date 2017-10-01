select
    $[params.f_page('d', 'day', {no_timezone: true})]$ as page
  , $[params.f_section('d', 'day', {no_timezone: true})]$ as section
  , $[params.f_row('d', 'day', {no_timezone: true})]$ as row
  , sum(d.ptb_revenue) :: int as revenue
  , sum(d.cpa_cost) :: int as hcost
  , sum(d.sale_count) :: int as hsales
  , sum(d.sale_pixel_delayed_count + d.sale_pixel_direct_count) :: int as hpixels
from reports_ams.drt_full d
where d.day >= '$from_date$'
  and d.day < '$to_date$'
  and $[params.f_filter('d')]$
group by page, section, row
order by page, section, row