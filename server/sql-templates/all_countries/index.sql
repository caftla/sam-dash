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
  , c.affiliate_name
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
  , c.affiliate_name