select 
  $[params.f_page('t', 'timestamp')]$ as page
, $[params.f_section('t', 'timestamp')]$ as section
, $[params.f_row('t', 'timestamp')]$ as row
, sum(case when t.dnstatus = 'Pending' then 1 else 0 end) :: int as pending 
, sum(case when t.dnstatus = 'Delivered' then 1 else 0 end) :: int as delivered
, sum(case when t.dnstatus = 'Refunded' then 1 else 0 end) :: int as refunded
, sum(case when t.dnstatus = 'Failed' then 1 else 0 end) :: int as failed
, sum(case when t.dnstatus not in ('Pending', 'Delivered', 'Refunded', 'Failed') then 1 else 0 end) :: int as unknown 
, sum(1) :: int as total
from transactions t
where t.timestamp >= $[params.from_date_tz]$
  and t.timestamp < $[params.to_date_tz]$
  and t.tariff > 0
  and $[params.f_filter('t')]$
group by page, section, row
order by page, section, row