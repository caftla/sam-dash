select
    d.country_code
  , d.operator_code
  , extract('year' from date_trunc('month', d.day)) as year_code
  , extract('month' from date_trunc('month', d.day)) as month_code
  , sum(d.ptb_revenue) :: int as revenue
  , sum(d.cpa_cost) :: int as cost
  , sum(d.sale_count) :: int as sales
  , sum(d.sale_pixel_delayed_count + d.sale_pixel_direct_count) :: int as pixels
from reports_ams.drt d
where d.day >= '$from_date$'
  and $[(x => !x ? 'true' : R.compose(R.join(' and '), R.map(([k, v])=> `d.${k}='${v}'`), R.splitEvery(2), R.split(','))(x))(params.filter)]$
group by country_code, operator_code, year_code, month_code
order by country_code, operator_code, year_code, month_code
