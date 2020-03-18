with T as (
  select
      c.country_code
    , c.operator_code 
    , c.affiliate_id
    , c.handle_name
    , c.platform
    , c.gateway
    , c.ad_name
    , c.scenario_name
    , c.service_identifier1
    , c.pacid
  
  from user_sessions c
  where c.timestamp >= '$from_date$'
    and c.timestamp <= '$to_date$'
  group by
      c.country_code
    , c.operator_code 
    , c.affiliate_id
    , c.handle_name
    , c.platform
    , c.gateway
    , c.ad_name
    , c.scenario_name
    , c.service_identifier1
    , c.pacid
) 
select T.*
, c.xcid
, c.date_created as ouisys_campaign_date_created
, c.comments as ouisys_campaign_comments, a.affiliate_name 
, c.xcid || ' (' || c.id :: text || ' ' || coalesce(T.affiliate_id, '') || '): ' || trim(coalesce(c.comments, '')) || ': ' || LEFT(c.date_created :: text, 10) as ouisys_campaign_name
from T 
inner join affiliate_mapping a on a.affiliate_id = T.affiliate_id
left join campaigns_sources_pages c on c.id = T.pacid