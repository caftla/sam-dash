with Pixels as (
    select 
		  ub.country_code
		, ub.operator_code
    , sum(ub.pixel + ub.delayed_pixel) :: float as pixels
		, sum(coalesce(ub.home_cpa, 0)) :: float as total
    , c.home_cpa as cpa

		from user_subscriptions ub
		left join cpa c on c.cpa_id = ub.cpa_id
		where ub.pixel_timestamp >= $[params.from_date_tz]$
      and ub.pixel_timestamp < $[params.to_date_tz]$
			and $[params.f_filter('ub', {fieldMap: {'publisher_id': 'pubid'}})]$
			and ub.pixel_timestamp is not null
			and c.home_cpa is not null

			group by 1,2,5
			order by 1,2,5 desc
)

, Views as (
	select
		us.country_code
	, us.operator_code
	, sum(coalesce(case when us.impression > 0 then 1 else 0 end, 0)) :: float as views
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
	p.*
, v.*
, a.additional_pixels
, a.additional_pixels_cpa
, co.timezone

from Pixels p
		left join Views v on v.country_code = p.country_code and v.operator_code = p.operator_code
		left join Additional_costs a on a.country_code = p.country_code
		left join countries co on v.country_code = co.country_code

		order by 1,2