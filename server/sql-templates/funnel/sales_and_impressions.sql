	select
		sum(case when sale > 0 then 1 else 0 end) as sales,
    sum(case when impression > 0 then 1 else 0 end) as impressions,
		date_trunc('day', us.timestamp) as d_day

					
	from user_sessions us
		
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
      
	group by d_day
  order by d_day