with RawSales as (
  select
      e.rockman_id
    , e.country_code
    , e.operator_code
    , e.affiliate_id
    , SUM(case when e.sale then 1 else 0 end) as sales
    , SUM(case when e.firstbilling then 1 else 0 end) as firstbillings
  from public.events e
  where e.timestamp >= '$from_date$'
    and e.timestamp <= '$to_date$'
    and $[(x => !x ? 'true' : R.compose(R.join(' and '), R.map(([k, v])=> `e.${k}='${v}'`), R.splitEvery(2), R.split(','))(x))(params.filter)]$
    and (e.sale = 1 or e.firstbilling = 1)
  group by
      e.rockman_id
    , e.country_code
    , e.operator_code
    , e.affiliate_id
)

, Sales as (

  select
      s.rockman_id
    , s.operator_code
    , e.ip_address
    , reverse(substring(reverse(coalesce(e.ip_address, '0.0.0.0')) from position('.' in reverse(coalesce( e.ip_address, '0.0.0.0'))) + 1)) as ip3
    , s.sales
    , s.firstbillings
  from RawSales s
  inner join public.events e
  on e.rockman_id = s.rockman_id
  where e.timestamp >= '$from_date$'
    and e.timestamp <= '$to_date$'
    and $[(x => !x ? 'true' : R.compose(R.join(' and '), R.map(([k, v])=> `e.${k}='${v}'`), R.splitEvery(2), R.split(','))(x))(params.filter)]$
    and e.view = 1

)

, SalesIPs as (

  select s.operator_code, s.ip3
    , sum(case when s.sales > 0 then 1 else 0 end) :: int as sales
    , sum(case when s.firstbillings > 0 then 1 else 0 end) :: int  as firstbillings
  from Sales s
  group by s.operator_code, s.ip3
)

, Views as (

  select reverse(substring(reverse(coalesce(e.ip_address, '0.0.0.0')) from position('.' in reverse(coalesce( e.ip_address, '0.0.0.0'))) + 1)) as ip3
    , SUM(1) :: int as views

  from public.events e
  where e.timestamp >= '$from_date$'
    and e.timestamp <= '$to_date$'
    and $[(x => !x ? 'true' : R.compose(R.join(' and '), R.map(([k, v])=> `e.${k}='${v}'`), R.splitEvery(2), R.split(','))(x))(params.filter)]$
    and e.view = 1
  group by reverse(substring(reverse(coalesce(e.ip_address, '0.0.0.0')) from position('.' in reverse(coalesce( e.ip_address, '0.0.0.0'))) + 1))
)

select s.*, v.views
from SalesIPs s
inner join Views v on s.ip3 = v.ip3
