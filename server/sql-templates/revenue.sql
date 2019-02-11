with sales as (
  {$ select({
    tableAlias: 'us',
    timeColName: 'timestamp',
    engine: 'Redshift'
  }) $}
  , sum(case when us.sale > 0 then 1 else 0 end) :: float as sales
  , sum(case when us.pixel > 0 or us.delayed_pixel > 0 then 1 else 0 end) :: float as pixels
  , sum(case when us.firstbilling > 0 then 1 else 0 end) :: float as firstbillings
  , sum(coalesce(us.home_cpa, 0)) :: float as cost
  , sum(us.tb_first_week_revenue)::float as week1_revenue
    
  from user_subscriptions us

  {$ where({
    tableAlias: 'us',
    timeColName: 'timestamp',
    engine: 'Redshift'
  }) $}

  {$ groupBy() $}
  {$ orderBy() $}
), 
revenue as (
  {$ select({
  tableAlias: 'd',
  timeColName: 'timestamp',
  engine: 'Redshift'
  }) $}
  , sum(d.revenue) :: float as revenue
  , sum(d.local_currency_revenue) :: float as local_currency_revenue

  from revenue d 

  {$ where({
  tableAlias: 'd',
  timeColName: 'timestamp',
  engine: 'Redshift'
  }) $}

  {$ groupBy() $}
  {$ orderBy() $}
)
select * from sales as s
full join revenue as r on {$ joinDimensions({tableAlias: 's'}, {tableAlias: 'r'}) $}
{$ orderBy({tableAlias: 'r'}) $}