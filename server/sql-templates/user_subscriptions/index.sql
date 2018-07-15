select  
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

from user_sessions us

where us.timestamp >=  $[params.from_date_tz]$
  and us.timestamp <  $[params.to_date_tz]$

  and $[params.f_filter('us', {fieldMap: {'publisher_id': 'pubid'}})]$
  and sale > 0