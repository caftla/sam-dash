{$ select({
  tableAlias: 'c',
  timeColName: 'creation_time',
  fieldMap: {}
}) $}
, sum(case when c.state = 'SuccessDisbursementNotificationReceived' then 1 else 0 end) as success
, sum(case when c.state = 'FailChargeResponseReceived' then 1 else 0 end) as invalid_msisdn
, sum(case when c.state = 'FailDisbursementNotificationReceived' then 1 else 0 end) as fail_disbursement
, sum(case when c.state = 'SuccessChargeResponseReceived' then 1 else 0 end) as pending_charge_request
, count(distinct c.msisdn) as distinct_msisdns
, count(distinct c.msisdn) FILTER (WHERE c.state = 'SuccessDisbursementNotificationReceived') as distinct_success
from charge_request c
{$ groupBy() $}
{$ orderBy() $}
