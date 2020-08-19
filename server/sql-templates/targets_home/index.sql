with bupper as (
  select * from  dblink('helix_server'::text, $$
    with
        calendar as (
          (select dateadd(day, -31 - 1, current_date) :: timestamp at time zone 0 as day) union
          (select dateadd(day, -1, current_date) :: timestamp at time zone 0 as day)
        
        )
      
      
      , cost_now as (
        select
          dateadd(day, -1, current_date) :: timestamp at time zone 0 as day
        -- , day
        , country_code
        , cost
        , sales
        , pixels
        , dmb_sales
        , aff_sales
        , dmb_cost
        , aff_cost
        , (case when sales = 0 then null else cost / sales end) as ecpa
        , (case when dmb_sales = 0 then null else dmb_cost / dmb_sales end) as dmb_ecpa
        , (case when aff_sales = 0 then null else aff_cost / aff_sales end) as aff_ecpa
        , (case when sales = 0 then null else firstbilling :: float / sales end) as cq 
        , (case when dmb_sales = 0 then null else dmb_firstbilling :: float / dmb_sales end) as dmb_cq 
        , (case when aff_sales = 0 then null else aff_firstbilling :: float / aff_sales end) as aff_cq 
        from (
          select 
              coalesce(us.country_code, 'XX') as country_code
            -- , date_trunc('day', us.timestamp) :: timestamp at time zone 0 as day
            , sum(us.home_cpa) as cost
            , sum(us.sale) as sales
            , sum(us.pixel) as pixels
            , sum(us.firstbilling) as firstbilling
            , sum(case when us.affiliate_id ilike '%DMB' then us.home_cpa else 0 end) as dmb_cost
            , sum(case when us.affiliate_id ilike '%DMB' then us.sale else 0 end) as dmb_sales
            , sum(case when us.affiliate_id ilike '%DMB' then us.firstbilling else 0 end) as dmb_firstbilling
            , sum(case when us.affiliate_id not ilike '%DMB' then us.home_cpa else 0 end) as aff_cost
            , sum(case when us.affiliate_id not ilike '%DMB' then us.sale else 0 end) as aff_sales
            , sum(case when us.affiliate_id not ilike '%DMB' then us.firstbilling else 0 end) as aff_firstbilling
          from user_subscriptions us  
          where us.timestamp > dateadd(day, $[params.cost_now_window]$, current_date)
            and us.timestamp < dateadd(day, 0, current_date)
          group by country_code
          order by country_code
        )
      )
      
      , cost_before as (
        select
          dateadd(day, -31 - 1, current_date) :: timestamp at time zone 0 as day
          -- day
        , country_code
        , cost
        , sales
        , pixels
        , dmb_sales
        , aff_sales
        , dmb_cost
        , aff_cost
        , (case when sales = 0 then null else cost / sales end) as ecpa
        , (case when dmb_sales = 0 then null else dmb_cost / dmb_sales end) as dmb_ecpa
        , (case when aff_sales = 0 then null else aff_cost / aff_sales end) as aff_ecpa
        , (case when sales = 0 then null else firstbilling :: float / sales end) as cq 
        , (case when dmb_sales = 0 then null else dmb_firstbilling :: float / dmb_sales end) as dmb_cq 
        , (case when aff_sales = 0 then null else aff_firstbilling :: float / aff_sales end) as aff_cq 
        from (
          select 
              coalesce(us.country_code, 'XX') as country_code
            -- , date_trunc('day', us.timestamp) :: timestamp at time zone 0 as day
            , sum(us.home_cpa) as cost
            , sum(us.sale) as sales
            , sum(us.pixel) as pixels
            , sum(us.firstbilling) as firstbilling
            , sum(case when us.affiliate_id ilike '%DMB' then us.home_cpa else 0 end) as dmb_cost
            , sum(case when us.affiliate_id ilike '%DMB' then us.sale else 0 end) as dmb_sales
            , sum(case when us.affiliate_id ilike '%DMB' then us.firstbilling else 0 end) as dmb_firstbilling
            , sum(case when us.affiliate_id not ilike '%DMB' then us.home_cpa else 0 end) as aff_cost
            , sum(case when us.affiliate_id not ilike '%DMB' then us.sale else 0 end) as aff_sales
            , sum(case when us.affiliate_id not ilike '%DMB' then us.firstbilling else 0 end) as aff_firstbilling
          from user_subscriptions us  
          where us.timestamp > dateadd(day, -31 - 31, current_date)
            and us.timestamp < dateadd(day, -31, current_date)
          group by country_code
          order by country_code
        )
      )
      
      , arpu_now as (
        select 
          dateadd(day, -1, current_date) :: timestamp at time zone 0 as day
        , country_code
        , (case when dmb_sales_7 = 0 then null else dmb_revenue_7 / dmb_sales_7 end) as dmb_arpu_7
        , (case when aff_sales_7 = 0 then null else aff_revenue_7 / aff_sales_7 end) as aff_arpu_7
        from (
          select 
              coalesce(us.country_code, 'XX') as country_code
            -- , date_trunc('day', us.timestamp) :: timestamp at time zone 0 as day
            , sum(case when date_diff('days', us.sale_timestamp, current_date) >= 8 and us.affiliate_id ilike '%DMB' then us.tb_first_week_revenue else null end) as dmb_revenue_7
            , sum(case when date_diff('days', us.sale_timestamp, current_date) >= 8 and us.affiliate_id ilike '%DMB' then 1 else null end) as dmb_sales_7
            , sum(case when date_diff('days', us.sale_timestamp, current_date) >= 8 and us.affiliate_id not ilike '%DMB' then us.tb_first_week_revenue else null end) as aff_revenue_7
            , sum(case when date_diff('days', us.sale_timestamp, current_date) >= 8 and us.affiliate_id not ilike '%DMB' then 1 else null end) as aff_sales_7
          from user_subscriptions us  
          where us.timestamp > dateadd(day, -31, current_date)
            and us.timestamp < dateadd(day, 0, current_date)
          group by country_code --, day
          order by country_code --, day
        )
      )
      
      
      , arpu_before as (
        select 
          dateadd(day, -31 - 1, current_date) :: timestamp at time zone 0 as day
        , country_code
        , (case when dmb_sales_7 = 0 then null else dmb_revenue_7 / dmb_sales_7 end) as dmb_arpu_7
        , (case when aff_sales_7 = 0 then null else aff_revenue_7 / aff_sales_7 end) as aff_arpu_7
        from (
          select 
              coalesce(us.country_code, 'XX') as country_code
            -- , date_trunc('day', us.timestamp) :: timestamp at time zone 0 as day
            , sum(case when date_diff('days', us.sale_timestamp, current_date) >= 8 and us.affiliate_id ilike '%DMB' then us.tb_first_week_revenue else null end) as dmb_revenue_7
            , sum(case when date_diff('days', us.sale_timestamp, current_date) >= 8 and us.affiliate_id ilike '%DMB' then 1 else null end) as dmb_sales_7
            , sum(case when date_diff('days', us.sale_timestamp, current_date) >= 8 and us.affiliate_id not ilike '%DMB' then us.tb_first_week_revenue else null end) as aff_revenue_7
            , sum(case when date_diff('days', us.sale_timestamp, current_date) >= 8 and us.affiliate_id not ilike '%DMB' then 1 else null end) as aff_sales_7
          from user_subscriptions us  
          where us.timestamp > dateadd(day, -31 - 31, current_date)
            and us.timestamp < dateadd(day, -31, current_date)
          group by country_code --, day
          order by country_code --, day
        )
      )
      
      , revenue_now as (
        select
          dateadd(day, -1, current_date) :: timestamp at time zone 0 as day,
          country_code,
          sum(revenue) as revenue
        from
            (
              (
                select
                    coalesce(us.country_code, 'XX') as country_code,
                    sum(us.revenue) as revenue
                from revenue us
                where
                    us.timestamp > dateadd(day, -31, current_date)
                    and us.timestamp < dateadd(day, 0, current_date)
                group by
                    country_code
                order by
                    country_code
              )
              union
              (
                select
                  'SA' as country_code,
                  sum(
                      case when operator = 'Mobily' then usd_revenue * 0.34 
                          when operator = 'Zain' then usd_revenue * 0.3264 
                          when operator = 'STC' then usd_revenue * 0.425 end
                  ) as revenue
                
                from mobimind_revenue r
                where
                    r.start_timestamp > dateadd(day, -31, current_date)
                    and r.start_timestamp < dateadd(day, 0, current_date)
                group by
                    country_code
              )
              union
              (
                select
                  'KW' as country_code,
                  sum(mt2.revenue_usd)* 0.40 * 0.95 * 0.90 as revenue

                from mt2_revenue mt2

                where 
                  mt2.date > dateadd(day, -31, current_date)
                  and mt2.date < dateadd(day, 0, current_date)

                group by country_code         	
              )
            )
    
        group by day, country_code
        order by country_code
      )
      
      , revenue_before as (
        select 
          dateadd(day, -31 - 1, current_date) :: timestamp at time zone 0 as day
        , country_code
        , sum(revenue) as revenue
        from 
          (
            (
              select 
                  coalesce(us.country_code, 'XX') as country_code
                , sum(us.revenue) as revenue
              from revenue us  
              where 
                us.timestamp > dateadd(day, -31 - 31, current_date)
                and us.timestamp < dateadd(day, -31, current_date)
              group by country_code --, day
              order by country_code --, day

            )
            union
            (
              select
                'SA' as country_code,
                sum(
                    case when operator = 'Mobily' then usd_revenue * 0.34 
                        when operator = 'Zain' then usd_revenue * 0.3264 
                        when operator = 'STC' then usd_revenue * 0.425 end
                ) as revenue
              
              from mobimind_revenue r
              where
                  r.start_timestamp > dateadd(day, -31 - 31, current_date)
                  and r.start_timestamp < dateadd(day, -31, current_date)
              group by
                  country_code
            )
          union
          (
            select
              'KW' as country_code,
              sum(mt2.revenue_usd)* 0.40 * 0.95 * 0.90 as revenue

            from mt2_revenue mt2

            where 
              mt2.date > dateadd(day, -31 - 31, current_date)
              and mt2.date < dateadd(day, -31, current_date)

            group by country_code         	
          )
        )
        
      group by day, country_code
      order by country_code      
    )  
      , all_country_codes as (
        select distinct country_code from (
          (select distinct country_code from cost_now) union 
          (select distinct country_code from cost_before) union
          (select distinct country_code from arpu_now) union
          (select distinct country_code from arpu_before) union
          (select distinct country_code from revenue_now) union
          (select distinct country_code from revenue_before)
        )
      )
      
      , country_code_calendar as (
        select c.day, a.country_code
        from calendar c, all_country_codes a
        order by a.country_code, c.day
      )
      
      
      , a as (select * from arpu_now union select * from arpu_before)
      , c as (select * from cost_before union select * from cost_now)
      , r as (select * from revenue_now union select * from revenue_before)
      
      select cal.country_code, cal.day
      , c.cost
      , c.sales
      , c.pixels
      , c.dmb_sales
      , c.aff_sales
      , c.dmb_cost
      , c.aff_cost
      , c.ecpa
      , c.cq
      , c.dmb_ecpa
      , c.aff_ecpa
      , c.dmb_cq
      , c.aff_cq
      , a.dmb_arpu_7
      , a.aff_arpu_7
      , r.revenue
      from country_code_calendar cal
      left join c on cal.country_code = c.country_code and cal.day = c.day
      left join a on cal.country_code = a.country_code and cal.day = a.day
      left join r on cal.country_code = r.country_code and cal.day = r.day
      order by cal.country_code, cal.day



    $$ ::text) t1 (
      country_code text
    , day timestamp with time zone
    , cost float
    , sales float
    , pixels float
    , dmb_sales float
    , aff_sales float
    , dmb_cost float
    , aff_cost float
    , ecpa float
    , cq float
    , dmb_ecpa float
    , aff_ecpa float
    , dmb_cq float
    , aff_cq float
    , dmb_arpu_7 float
    , aff_arpu_7 float
    , revenue float
  )
  
)

, B as (
  select * from bupper 
)
, T as (

  select * from (
    select DISTINCT ON (country_code, start_date)
    *, 
    rank() OVER (PARTITION by country_code order by start_date desc) as rnk
    from sales_targets
    where country_code is not null
    order by start_date desc
  )  t where t.rnk = 1
)

select B.*
, t."start_date"
, t."min_aff_sales"
, t."max_aff_sales"
, t."min_dmb_sales"
, t."max_dmb_sales"
, t."ecpa_target"
, t."actual_aff_sales"
, t."actual_dmb_sales"
, t."actual_aff_ecpa"
, t."actual_dmb_ecpa"
from B left join T on B.country_code = T.country_code
order by B.country_code, B.day desc
