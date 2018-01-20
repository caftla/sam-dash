
select  
    $[params.f_page('us', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as page
  , $[params.f_section('us', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as section
  , $[params.f_row('us', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as row
  , sum(case when us.impression > 0 then 1 else 0 end) :: float as views
  , sum(case when us.sale > 0 then 1 else 0 end) :: float as sales
  , sum(case when us.pixel > 0 then 1 else 0 end) :: float as pixels
  , sum(case when us.firstbilling > 0 then 1 else 0 end) :: float as firstbillings
  , sum(coalesce(c.home_cpa, 0)) :: float as cost
  , sum(case when us.optout > 0 then 1 else 0 end) :: float as optouts
  , sum(case when us.optout > 0 and date_diff('hours', us.sale_timestamp, us.optout_timestamp) < 24 then 1 else 0 end) :: float as optout_24h
  , sum(case when us.resubscribe > 0 then 1 else 0 end) :: float as resubs
  , sum(case when us.mouseclick > 0 or us.touch > 0 then 1 else 0 end) :: float as clicks_or_touches
  , sum(case when us.lead1 > 0 then 1 else 0 end) :: float as lead1s
  , sum(case when us.lead2 > 0 then 1 else 0 end) :: float as lead2s
  , sum(case when us.lead1 > 0 or us.lead2 > 0 then 1 else 0 end) :: float as any_leads
  , sum(case when us.resubscribe > 0 and us.pixel > 0 then 1 else 0 end) :: float as pixels_for_resubs
  , sum(case when us.firstbilling <= 0 and us.pixel > 0 then 1 else 0 end) :: float as pixels_for_no_firstbilling
  , sum(case when us.firstbilling > 0 and us.resubscribe <= 0 and us.pixel <= 0 then 1 else 0 end) :: float as missed_good_pixels
  
from user_sessions us
left join user_subscriptions as ub on ub.rockman_id = us.rockman_id
left join cpa c on c.cpa_id = ub.cpa_id
where us.timestamp >=  $[params.from_date_tz]$
  and us.timestamp <  $[params.to_date_tz]$
  and $[params.f_filter('us', {fieldMap: {'publisher_id': 'pubid'}})]$
group by page, section, row
order by page, section, row