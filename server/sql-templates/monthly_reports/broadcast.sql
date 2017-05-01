SELECT
  country_code,
  operator_code,
  extract('year' from start_of_month) as year_code,
  extract('month' from start_of_month) as month_code,
  SUM(msg_sent) msg_sent,
  SUM(msg_failed) AS msg_failed,
  SUM(msg_delivered) AS msg_delivered,
  SUM(msg_pending) AS msg_pending,
  SUM(msg_undefined) AS msg_undefined,
  SUM(msg_refunded) AS msg_refunded
FROM (
  SELECT
    t.country_code AS country_code,
    t.operator_code AS operator_code,
    date_trunc('month', t.timestamp) as start_of_month,
    COUNT(*) msg_sent,
    SUM((CASE when (dnstatus = 'Failed') THEN 1 ELSE 0 END)) AS msg_failed,
    SUM((CASE when (dnstatus = 'Delivered') THEN 1 ELSE 0 END)) AS msg_delivered,
    SUM((CASE when (dnstatus = 'Pending') THEN 1 ELSE 0 END)) AS msg_pending,
    SUM((CASE when (dnstatus NOT IN ('Failed', 'Delivered', 'Pending', 'Refunded')) THEN 1 ELSE 0 END)) AS msg_undefined,
    SUM((CASE when (dnstatus = 'Refunded') THEN 1 ELSE 0 END)) AS msg_refunded
  FROM
    transactions t
  WHERE
    t.timestamp >= '$from_date$'
    AND t.rockman_id IS NOT NULL
    and $[(x => !x ? 'true' : R.compose(R.join(' and '), R.map(([k, v])=> `t.${k}='${v}'`), R.splitEvery(2), R.split(','))(x))(params.filter)]$
  GROUP BY
    t.country_code,
    t.operator_code,
    start_of_month

  UNION ALL

  SELECT
    t.country_code AS country_code,
    t.operator_code AS operator_code,
    date_trunc('month', t.timestamp) as start_of_month,
    COUNT(*) msg_sent,
    SUM((CASE when (dnstatus = 'Failed') THEN 1 ELSE 0 END)) AS msg_failed,
    SUM((CASE when (dnstatus = 'Delivered') THEN 1 ELSE 0 END)) AS msg_delivered,
    SUM((CASE when (dnstatus = 'Pending') THEN 1 ELSE 0 END)) AS msg_pending,
    SUM((CASE when (dnstatus NOT IN ('Failed', 'Delivered', 'Pending', 'Refunded')) THEN 1 ELSE 0 END)) AS msg_undefined,
    SUM((CASE when (dnstatus = 'Refunded') THEN 1 ELSE 0 END)) AS msg_refunded
  FROM
    dev.transactions_null t
  WHERE
    t.timestamp >= '$from_date$'
    and $[(x => !x ? 'true' : R.compose(R.join(' and '), R.map(([k, v])=> `t.${k}='${v}'`), R.splitEvery(2), R.split(','))(x))(params.filter)]$
  GROUP BY
    t.country_code,
    t.operator_code,
    start_of_month
)
GROUP BY
  country_code,
  operator_code,
  year_code,
  month_code
