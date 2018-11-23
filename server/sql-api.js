// @flow
const R = require('ramda')
const pg = require('pg')

type ParamsOptions = {
    fix_gateway?: string
  , no_timezone?: boolean
  , double_quote?: boolean
  , fieldMap?: Object
}

// because publisher_id is named differently in different tables
const useFieldMap = (options : ParamsOptions, param_value1: string) : string =>
  !!options && !!options.fieldMap && !!options.fieldMap[param_value1]
  ? options.fieldMap[param_value1] 
  : param_value1

const makeQuery = (query_template: string, params: Object) => {
  var query = query_template;

  const add_date_trunc_params = (param_name: string) => {
    const param_value1 = params[param_name];
    params[`f_${param_name}`] = (table: string, day_column: string, options: ParamsOptions) => {
      const param_value = useFieldMap(options, param_value1);

      const date_exp = !!options && options.no_timezone === true ? `date_trunc('${param_value}', ${table}.${day_column})` : !!options && options.no_timezone === 0 ? `date_trunc('${param_value}', CONVERT_TIMEZONE('UTC', '${-1 * parseFloat(params.timezone)}', ${table}.${day_column})) :: timestamp AT TIME ZONE '0'` : `date_trunc('${param_value}', CONVERT_TIMEZONE('UTC', '${-1 * parseFloat(params.timezone)}', ${table}.${day_column})) :: timestamp AT TIME ZONE '${-1 * parseFloat(params.timezone)}'`;

      let result = !param_value || 
          param_value == "-" ? 
            `'-'` 
        : ["screen_width", "screen_height"].some(i => i == param_value) ? 
          `round(${table}.${param_value} / 50) :: Int * 50` 
        : "screen_size" == param_value ? 
          `coalesce(cast(round(${table}.screen_width/ 50) :: Int * 50 as varchar) || 'X' || cast(round(${table}.screen_height/ 50) :: Int * 50 as varchar), 'Unknown')`
        : ["viewport_width", "viewport_height"].some(i => i == param_value) ?
          `round(${table}.${param_value} / 50) :: Int * 50` 
        : "viewport_size" == param_value ? 
          `coalesce(cast(round(${table}.viewport_width/ 50) :: Int * 50 as varchar) || 'X' || cast(round(${table}.viewport_height/ 50) :: Int * 50 as varchar), 'Unknown')` 
        : ["hour", "day", "week", "month"].some(p => p == param_value) ? 
            date_exp 
        : param_value == "landing_page" ?
            `('http:' || substring(${table}.landing_page_url, (case when ${table}.landing_page_url like 'https%' then 7 else 6 end), charindex('?', ${table}.landing_page_url) - (case when ${table}.landing_page_url like 'https%' then 7 else 6 end)))`
        : param_value == "gateway" ?
          `
            (case 
              when ${table}.country_code = 'IQ' and (${table}.${param_value} = 'UU' or ${table}.${param_value} = 'DOUBLEU') then 'IQ_DOUBLEU'
              when ${table}.country_code = 'MY' and (${table}.${param_value} = 'MK' or ${table}.${param_value} = 'MY_MK') then 'MY_MACROKIOSK'
              when ${table}.country_code = 'TH' and (${table}.${param_value} = 'MK' or ${table}.${param_value} = 'TH_MK') then 'TH_MACROKIOSK'
              when position('_' in ${table}.${param_value}) < 1 then (${table}.country_code || '_' || (case when LEN(${table}.${param_value}) = 0 then 'Unknown' else coalesce(${table}.${param_value}, 'Unknown') end))
              else (case when LEN(${table}.${param_value}) = 0 then 'Unknown' else coalesce(${table}.${param_value}, 'Unknown') end) 
            end)
          `
        : param_value == "operator*gateway" ?
          `coalesce(${table}.operator_code, 'Unknown') || ' * ' || coalesce(${table}.gateway, 'Unknown')`

        : param_value == "hour_of_day" ? 
          `date_part(h, CONVERT_TIMEZONE('UTC', '${-1 * parseFloat(params.timezone)}', ${table}.${day_column}))`
        : `coalesce(cast(${table}.${param_value} as varchar), 'Unknown')`;

      if (!!options && options.double_quote) {
        result = result.replace(/\'/g, "''");
      }
      return result;
    };

    return params;
  };

  params = add_date_trunc_params("page");
  params = add_date_trunc_params("section");
  params = add_date_trunc_params("row");

  params.from_date_tz = `CONVERT_TIMEZONE('${-1 * parseFloat(params.timezone)}', '0', '${params.from_date}')`;
  params.to_date_tz = `CONVERT_TIMEZONE('${-1 * parseFloat(params.timezone)}', '0', '${params.to_date}')`;

  params.from_date_tz_double_quote = `CONVERT_TIMEZONE(''${-1 * parseFloat(params.timezone)}'', ''0'', ''${params.from_date}'')`;
  params.to_date_tz_double_quote = `CONVERT_TIMEZONE(''${-1 * parseFloat(params.timezone)}'', ''0'', ''${params.to_date}'')`;

  params.f_normalize_gateway = (country_code, gateway) => `(case when position('_' in ${gateway}) > -1 then ${gateway} else (${country_code} || '_' || ${gateway}) end)`;

  const addHttp = url =>
    url.indexOf('http') == 0 ? url : `http://${url}`
  params.f_filter = (table: string, options: ParamsOptions) => (x => (!x ? "true" : R.compose(R.join(" and "), R.map(
              ([k, v]) =>
                R.compose(
                  x => `(${x})`,
                  R.join(" or "),
                  R.map(
                    v =>
                      k == "from_hour"
                        ? `date_part(h, CONVERT_TIMEZONE('UTC', '${-1 *
                            parseFloat(
                              params.timezone
                            )}', ${table}.timestamp) ) >= ${v}`
                        : k == "to_hour"
                          ? `date_part(h, CONVERT_TIMEZONE('UTC', '${-1 *
                              parseFloat(
                                params.timezone
                              )}', ${table}.timestamp) ) < ${v}`
                        : k == 'screen_size' ?
                          `coalesce(cast(round(${table}.screen_width/ 50) :: Int * 50 as varchar) || 'X' || cast(round(${table}.screen_height/ 50) :: Int * 50 as varchar), 'Unknown') = '${v}'`
                        : k == 'viewport_size' ?
                          `coalesce(cast(round(${table}.viewport_width/ 50) :: Int * 50 as varchar) || 'X' || cast(round(${table}.viewport_height/ 50) :: Int * 50 as varchar), 'Unknown') = '${v}'`
                        : k == 'landing_page'
                          ? `(${table}.landing_page_url LIKE '${addHttp(v)}%') OR (${table}.landing_page_url LIKE '${addHttp(v)}%')`
                        : !!options && !!options.double_quote
                          ? `${table}.${useFieldMap(options, k)}=''${v}''`
                          : `${table}.${useFieldMap(options, k)}='${v}'`
                  ),
                  R.split(";")
                )(v)
            ), R.splitEvery(2), R.split(","))(x)))(params.filter);

  R.keys(params).forEach(key => {
    const reg = new RegExp(`\\$${key}\\$`, "g");
    query = query.replace(reg, params[key]);
  });

  query = query.replace(/\$\[(.*)\]\$/gi, (_, match) => {
    return eval(match);
  })
  
  return query
}

const query = (connection_string: string, query_template:string, params: Object) => new Promise((resolve, reject) => {

  const query = makeQuery(query_template, params)

  const client = new pg.Client(connection_string)

  client.connect((err, conn, done) => {
    if(err) {
      client.end();
      return reject(err)
    }
    console.log('---------', 'conn.processID = ', conn.processID, '---------')
    console.log(query)
    console.log('---------')
    client.query(query)
    .then(x =>  { client.end(); resolve(x) })
    .catch(x => { client.end(); reject(x) })
  })
})

module.exports = {query, makeQuery}
