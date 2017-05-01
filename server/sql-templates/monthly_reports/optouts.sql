
select
    extract('year' from start_of_month) as year_code
  , extract('month' from start_of_month) as month_code
  , country_code
  , operator_code
  , sum(views) as views
  , sum(sales) as sales
  , sum(optouts) as optouts
from (
  select
      date_trunc('month', e.timestamp) as start_of_month
    , e.country_code
    , e.operator_code
    , sum(e.view :: int) as views
    , sum(e.sale :: int) as sales
    , sum(e.optout :: int) as optouts
  from (
    select e.timestamp as timestamp
      , e.country_code
      , e.operator_code
      , (case when e.optout then e.start_timestamp else e.timestamp end) as start_timestamp
      , e.view, e.sale, e.optout
    from public.events e
    where e.timestamp > '$from_date$'
      and (e.start_timestamp is null or e.start_timestamp > '$from_date$')
      and $[(x => !x ? 'true' : R.compose(R.join(' and '), R.map(([k, v])=> `e.${k}='${v}'`), R.splitEvery(2), R.split(','))(x))(params.filter)]$
  ) e
  group by country_code, operator_code, start_of_month
  order by country_code, operator_code, start_of_month
) T
group by country_code, operator_code, year_code, month_code
order by country_code, operator_code, year_code, month_code
