--compare with revenue from subscriptions!!
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
),
transactions as (
  {$ select({
  tableAlias: 't',
  timeColName: 'timestamp',
  engine: 'Redshift'
  }) $}
  , count(*) :: float as successful_billings


  from transactions t 

  {$ where({
  tableAlias: 't',
  timeColName: 'timestamp',
  engine: 'Redshift'
  }) $}
  and t.dnstatus = 'Delivered'
  and t.tariff > 0

  {$ groupBy() $}
  {$ orderBy() $}
)

select * from sales as s
full join revenue as r on {$ joinDimensions({tableAlias: 's'}, {tableAlias: 'r'}) $}
full join transactions as t on {$ joinDimensions({tableAlias: 'r'}, {tableAlias: 't'}) $}

{$ orderBy({tableAlias: 'r'}) $}