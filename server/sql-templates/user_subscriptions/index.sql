select  
  --   $[params.f_page('us', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as page
  -- , $[params.f_section('us', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as section
  -- , $[params.f_row('us', 'timestamp', {fieldMap: {'publisher_id': 'pubid'}})]$ as row
us.service_identifier1 as short_code
, us.service_identifier2 as keyword
, us.service_identifier3 as activate_keyword
, us.timestamp as impression_date
, us.affiliate_name
, us.offer_id 
, us.affiliate_id
, us.pubid
, us.sub_id
, us.handle_name
, us.landing_page_url
, us.connection_type
, us.operator_code
, us.gateway
, us.ip
, us.platform
, us.sale
, us.firstbilling
, us.optout
, us.pixel
, us.delayed_pixel
, us.resubscribe
, us.scrub
, us.browser_name
, us.browser_version
, us.os_name
, us.os_version
, us.form_factor
, us.brand_name
, us.model_name
, us.sale_timestamp
, us.pixel_timestamp
, us.firstbilling_timestamp
, us.optout_timestamp
, us.optout_reason
, us.pixel_fire_url as pixel_url
, us.pixel_fire_response as pixel_response
, us.rockman_id

-- , tr.tariff
-- , tr.timestamp
-- , tr.dnstatus
-- , tr.retry_number

-- , pm.event_type                   
-- , pm.element_id
-- , pm.creation_datetime
-- , pm.insert_timestamp 
-- , pm.optout_reason

from user_subscriptions us
-- left join pacman as pm on pm.rockman_id = us.rockman_id
-- left join transactions as tr on tr.rockman_id = us.rockman_id

where us.timestamp >=  $[params.from_date_tz]$
  and us.timestamp <  $[params.to_date_tz]$

  -- and tr.timestamp >=  $[params.from_date_tz]$
  -- and tr.timestamp <  $[params.to_date_tz]$

  and $[params.f_filter('us', {fieldMap: {'publisher_id': 'pubid'}})]$
-- group by page, section, row
-- order by page, section, row


