select 

	distinct us.pubid as publisher_id
	
	
	from user_sessions us
	
	where 
    us.timestamp >= $[params.from_date_tz]$
    and us.timestamp < $[params.to_date_tz]$
		and $[params.f_filter('us', {fieldMap: {'publisher_id': 'pubid'}})]$
		and sale > 0;