select 
  $[params.f_page('e', 'day')]$ as page
, $[params.f_section('e', 'day')]$ as section
, e.ip3 as row
, sum(case when e.impression > 0 then 1 else 0 end) :: int as views
, sum(case when e.pixel > 0 then 1 else 0 end) :: int as pixels
, sum(case when e.sale > 0 then 1 else 0 end) :: int as sales
, sum(case when e.firstbilling then 1 else 0 end) :: int as firstbillings
, sum(coalesce(c.home_cpa, 0)) :: float as cost
from public.user_sessions e
left join cpa c on c.cpa_id = e.cpa_id
where e.timestamp >= '$from_date$'
  and e.timestamp <= '$to_date$'
  and $[params.f_filter('e')]$
  
group by page, section, row
order by page, section, row


