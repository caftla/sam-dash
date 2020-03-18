--TODO: add breakdown dimensions
with R as (
	select
		date_trunc('day', us.timestamp) as d_day
		, us.rockman_id
		, T.category
		, T.action
		, T.label
		, T.number
	
	from user_sessions us
	left join (
			select
		  	fe.label,
		  	fe.category,
		  	fe.action,
		  	fe.rockman_id,
		  	min(fe.number) as number
		  		  	
						
				from flow_events fe
				
				where
          	timestamp >= {$ dateFrom() $}
        and timestamp < {$ dateTo() $}
				and action = 'advance'
				group by label, category, action, rockman_id
	) T using (rockman_id)
		
	where
			timestamp >= {$ dateFrom() $}
	and timestamp < {$ dateTo() $}
  and pacid = (
		select
			c.id

		from campaigns_sources_pages c
		where
			{$ filters({
				tableAlias: 'c',
				timeColName: 'timestamp',
				engine: 'Redshift'
				})
			$}
	)
		
	  group by d_day, rockman_id, category, action, label, number 
)	


select
	R.d_day :: timestamp as d_day
	, count(distinct R.rockman_id) as users
	, R.label
	, R.category
	, R.action
	, min(R.number) as number

from R

group by d_day, category, action, label
order by d_day, number asc