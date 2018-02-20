SELECT 
    us.country_code, us.operator_code
  , us.home_cpa as cpa
  , sum(case when us.resubscribe then 1 else 0 end) as resubscribes
  , sum(case when us.pixel > 0 or us.delayed_pixel > 0 then 1 else 0 end) as sales
  , sum(us.home_cpa) total
from user_subscriptions us 

where us.timestamp >=  $[params.from_date_tz]$
  and us.timestamp <  $[params.to_date_tz]$
  and (us.pixel > 0 or us.delayed_pixel > 0) 
  and $[params.f_filter('us', {fieldMap: {'publisher_id': 'pubid'}})]$

group by us.country_code, us.operator_code, cpa
order by us.country_code, us.operator_code, total desc
