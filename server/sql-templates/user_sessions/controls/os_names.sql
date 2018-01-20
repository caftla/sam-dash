SELECT us.os_name, count(*) as count 
from user_sessions us 
where us.timestamp > dateadd(day, -7, getdate()) 
  and us.timestamp < getdate() 
group by us.os_name 
order by count desc 
limit 100;