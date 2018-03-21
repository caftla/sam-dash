select
    $[params.f_page('d', 'timestamp', {no_timezone: 0})]$ as page
  , $[params.f_section('d', 'timestamp', {no_timezone: 0})]$ as section
  , $[params.f_row('d', 'timestamp', {no_timezone: 0})]$ as row
  , sum(d.revenue) :: float as revenue
from revenue d
where d.timestamp >= '$from_date$'
  and d.timestamp < '$to_date$'
  and $[params.f_filter('d')]$
group by page, section, row
order by page, section, row