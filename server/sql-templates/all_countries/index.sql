select
    c.country_code
  , array_agg(distinct c.operator_code) as operator_codes
  , array_agg(distinct c.affiliate_name) as affiliate_names
  , array_agg(distinct c.handle_name) as handle_names
  , array_agg(distinct c.platform) as platforms
  , array_agg(distinct c.gateway) as gateways
  , array_agg(distinct c.ad_name) as ad_names

from reports_ams.conversion_daily c
where c.date_tz >= '$from_date$'
  and c.date_tz <= '$to_date$'
group by c.country_code
