
with T as (
  select 
  fe.args, fe.timestamp as "event_timestamp", fe.category, fe.action, fe.label, fe.relative_time, fe.value, us.*
  , RANK() over (PARTITION BY fe.rockman_id ORDER BY fe.timestamp DESC) - 1 as rnk
  from user_sessions as us
  inner join flow_events fe on fe.rockman_id = us.rockman_id
{$ where({
  tableAlias: 'us',
  timeColName: 'timestamp',
  engine: 'Redshift',
  fieldMap: {
      'publisher_id': 'publid', 
      'landing_page': 'landing_page_url',
      'xcid': E"split_part(split_part(us.landing_page_url, '/', 4), '?', 1)"
  }
}) $}
    order by us.timestamp, fe.timestamp
)
, R as (
  select 
    T.rockman_id
  , MAX(T.ip) as ip
  , MIN(T.timestamp) as date_created
  , (case when SUM(T.sale) > 0 then true else false end) as sale
  -- , RTRIM(XMLAGG(XMLELEMENT(coalesce(T.args, '{}'),',').EXTRACT('//text()') ORDER BY T.event_timestamp).GetClobVal(),',')
  , LISTAGG(coalesce(T.args, '{}'), ',') as args
  , LISTAGG(case when T.category is null then 'null' else '"' || T.category || '"' end, ',') as categories
  , LISTAGG(case when T.action is null then 'null' else '"' || T.action || '"' end, ',') as actions
  , LISTAGG(case when T.label is null then 'null' else '"' || T.label || '"' end, ',') as labels
  , LISTAGG(coalesce(T.relative_time, 0), ',') as relative_times
  from T
  where rnk < 100
  group by T.rockman_id
)

select * from R order by date_created desc
limit 500