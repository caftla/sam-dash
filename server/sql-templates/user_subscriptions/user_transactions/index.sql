select 
tr.tariff
, tr.timestamp
, tr.dnstatus
, tr.retry_number

from transactions as tr 

	where tr.timestamp >=  $[params.from_date_tz]$
  and tr.timestamp <  $[params.to_date_tz]$

  and $[params.f_filter('tr', {fieldMap: {'publisher_id': 'pubid'}})]$