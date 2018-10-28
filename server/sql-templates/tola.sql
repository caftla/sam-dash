{$ select({
  tableAlias: 'I',
  timeColName: 'date_created',
  fieldMap: {}
}) $}
, sum(I.impressions) :: int as impressions
, sum(I.fake_clicks) :: int as fake_clicks
, sum(I.distinct_phones) :: int as distinct_phones
, sum(I.events_count) :: int as events_count
, sum(I.pre_flow_advance_events) :: int as pre_flow_advance_events
, sum(I.flow_advance_events) :: int as flow_advance_events
, sum(I.leads) :: int as leads
, sum(I.sales) :: int as sales
, sum(case when I.sales > 0 then 1 else 0 end) :: int as unique_sales_per_rockman_id
, sum(I.total_sale_amount) :: float as total_sale_amount
, avg(I.leads) :: float as avg_leads_per_rockman_id
, avg(I.max_re_leads_per_msisdn) :: float as avg_max_leads_per_msisdn
, percentile_disc(0.5) within group (order by extract(epoch from I.first_flow_advance_event_time - I.date_created)) as mode_first_flow_advance_event_time
, percentile_disc(0.5) within group (order by case when I.sales > 0 then extract(epoch from I.first_flow_advance_event_time - I.date_created) else null end) as mode_first_flow_advance_event_time_for_sales
, percentile_disc(0.5) within group (order by extract(epoch from I.avg_callback_time)) as mode_avg_callback_time
from tola_report_materialized I -- tola_example_report I
{$ where({
  tableAlias: 'I',
  timeColName: 'date_created',
  engine: 'PostgreSql',
  fieldMap: {}
}) $}
  -- where I.date_created > '2018-10-20'
  --   and I.date_created < '2018-10-21T09:00:00'
  --   and I.campaign_id = 5
{$ groupBy() $}
{$ orderBy() $}
