CREATE OR REPLACE FUNCTION pg_temp.after(a timestamp, b integer, c numeric) RETURNS numeric AS $$
  BEGIN
    RETURN CASE WHEN EXTRACT(day from now() - a) > b THEN c ELSE null END;
  END;
$$ LANGUAGE plpgsql
IMMUTABLE
RETURNS NULL ON NULL INPUT;

select
    d.country_code
  , operator_code
  , extract('year' from date_trunc('month', d.day)) as year_code
  , extract('month' from date_trunc('month', d.day)) as month_code
  , sum(d.home_cpa) :: int as cost
  , sum(d.sale_count) :: int as sales
  , sum(d.sale_pixel_delayed_count + d.sale_pixel_direct_count) :: int as pixels
  , sum(d.optout_24h) :: int as optout_24h
  , sum(d.firstbilling_count) :: int as firstbilling_count
  , safediv(SUM(pg_temp.after(d.day, 7, d.tb_first_week_revenue)), SUM(pg_temp.after(d.day, 7, d.sale_count))) :: float as arpu_week_1
  , safediv(SUM(pg_temp.after(d.day, 30, d.tb_first_month_revenue)), SUM(pg_temp.after(d.day, 30, d.sale_count))) :: float as arpu_month_1
  , safediv(SUM(pg_temp.after(d.day, 61, d.tb_first_month_revenue + tb_second_month_revenue)), SUM(pg_temp.after(d.day, 61, d.sale_count))) :: float as arpu_month_2
  , safediv(SUM(pg_temp.after(d.day, 91, d.tb_three_month_revenue)), SUM(pg_temp.after(d.day, 91, d.sale_count))) :: float as arpu_month_3
from reports_ams.rps_full d
where d.day >= '$from_date$'
  and $[(x => !x ? 'true' : R.compose(R.join(' and '), R.map(([k, v])=> `d.${k}='${v}'`), R.splitEvery(2), R.split(','))(x))(params.filter)]$
group by country_code, operator_code, year_code, month_code
order by country_code, operator_code, year_code, month_code
