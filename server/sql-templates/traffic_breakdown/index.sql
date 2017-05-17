select
    e.country_code
  , e.operator_code
  , e.affiliate_id
  , e.publisher_id
  , e.sub_id
  , SUM(case when e.view then 1 else 0 end) :: int as views
  , SUM(case when e.sale then 1 else 0 end) :: int as sales
  , SUM(case when e.firstbilling then 1 else 0 end) :: int as firstbillings
from public.events e
where e.timestamp >= '$from_date$'
  and e.timestamp <= '$to_date$'
  and $[(x => !x ? 'true' : R.compose(R.join(' and '), R.map(([k, v]) => R.compose(x => `(${x})`, R.join(' or '), R.map(v => `e.${k}='${v}'`), R.split(';'))(v)), R.splitEvery(2), R.split(','))(x))(params.filter)]$
  and (e.sale = 1 or e.firstbilling = 1 or e.view = 1)
group by
    e.country_code
  , e.operator_code
  , e.affiliate_id
  , e.publisher_id
  , e.sub_id
