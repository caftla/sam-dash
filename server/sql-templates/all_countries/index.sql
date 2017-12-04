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
  
  from events c
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
) 
select T.*, a.affiliate_name from T inner join affiliate_mapping a
on a.affiliate_id = T.affiliate_id
