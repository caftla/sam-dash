{$ select({
  tableAlias: 'I',
  timeColName: 'date_created',
  fieldMap: {}
}) $}
, count(*) :: int as impressions
, sum(case when I.pre_flow_advance_events > 0 then 1 else 0 end) :: int as pre_flow_advance_events
, sum(case when I.flow_advance_events > 0 then 1 else 0 end) :: int as flow_advance_events
, sum(I.sales) :: int as sales
, sum(case when I.is_in_targeted_ips_range then 1 else 0 end) :: int as in_targetted_ips_ranges
, sum(case when I.is_in_targeted_ips_range then (case when I.flow_advance_events > 0 then 1 else 0 end) else 0 end) :: int as in_targetted_ips_ranges_and_advanced_in_flow
from sigma_dmb_report as I
{$ where({
  tableAlias: 'I',
  timeColName: 'date_created',
  engine: 'PostgreSql',
  fieldMap: {}
}) $}
{$ groupBy() $}
{$ orderBy() $}
