with Pixels as (
    select 
			ub.country_code
		, ub.operator_code
		, sum(case when ub.pixel > 0 or ub.delayed_pixel > 0 then 1 else 0 end) :: float as pixels
    , sum(coalesce(ub.home_cpa, 0)) :: float as total
    , ub.home_cpa as cpa

		from user_subscriptions ub
		where ub.pixel_timestamp >= $[params.from_date_tz]$
      and ub.pixel_timestamp < $[params.to_date_tz]$
			and $[params.f_filter('ub', {fieldMap: {'publisher_id': 'pubid'}})]$
			and ub.pixel_timestamp is not null
			and ub.home_cpa is not null

			group by 1,2,5
			order by 1,2,5 desc
)

, Views as (
	select
		us.country_code
	, us.operator_code
	, sum(coalesce(case when us.impression > 0 or us.redirect > 0 then 1 else 0 end, 0)) :: float as views
  , sum(case when us.sale > 0 then 1 else 0 end) :: float as sales
  , sum(case when us.resubscribe > 0 then 1 else 0 end) :: float as resubscribes
	
	from user_sessions us
  where us.timestamp >= $[params.from_date_tz]$
      and us.timestamp < $[params.to_date_tz]$
			and $[params.f_filter('us', {fieldMap: {'publisher_id': 'pubid'}})]$

			group by 1,2
			order by 1,2 desc
)

, Additional_costs as (
	select
		ac.country_code
	, ac.pixel :: float as additional_pixels
	, ac.cpa :: float as additional_pixels_cpa

	from additional_costs ac

	 where ac.start_timestamp >= $[params.from_date_tz]$
      and ac.end_timestamp < $[params.to_date_tz]$
			and $[params.f_filter('ac', {fieldMap: {'publisher_id': 'pubid'}})]$
)


select 
	coalesce(p.country_code, a.country_code) as country_code
, p.operator_code as operator_code
, coalesce(v.views, 0) as views
, coalesce(v.sales, 0) as sales
, coalesce(p.pixels, 0) as pixels
, coalesce(v.resubscribes, 0) as resubscribes
, coalesce(a.additional_pixels, 0) as additional_pixels
, coalesce(a.additional_pixels_cpa, 0) as additional_pixels_cpa
, coalesce(p.cpa, 0) as cpa
, coalesce(p.total, 0) as total
, co.timezone

from Pixels p
		full join Views v on v.country_code = p.country_code and v.operator_code = p.operator_code
		full join Additional_costs a on a.country_code = p.country_code
		full join countries co on v.country_code = co.country_code
where coalesce(p.country_code, a.country_code) is not null
order by 1,2