select 
    us.country_code
  , us.operator_code
  -- , ub.home_cpa as cpa
  , sum(coalesce(case when us.impression > 0 then 1 else 0 end, 0)) :: float as views
  , sum(case when ub.pixel > 0 or ub.delayed_pixel > 0 then 1 else 0 end) :: float as sales
  , sum(case when ub.resubscribe > 0 then 1 else 0 end) :: float as resubscribes
  , sum(coalesce(c.home_cpa, 0)) :: float as total
  , co.timezone

from user_sessions us
left join countries co on co.country_code = us.country_code 
left join user_subscriptions as ub on ub.rockman_id = us.rockman_id
left join cpa c on c.cpa_id = ub.cpa_id

where us.timestamp >=  $[params.from_date_tz]$
  and us.timestamp <  $[params.to_date_tz]$
  -- and (us.pixel > 0 or us.delayed_pixel > 0) 
  and $[params.f_filter('us', {fieldMap: {'publisher_id': 'pubid'}})]$

group by us.country_code, us.operator_code, co.timezone
order by us.country_code asc, total desc

