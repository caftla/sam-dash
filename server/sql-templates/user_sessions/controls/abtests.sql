SELECT ab_test, count(*) as count from pacman us 
where us.timestamp >=  $[params.from_date_tz]$
  and us.timestamp <  $[params.to_date_tz]$
group by ab_test