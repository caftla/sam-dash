// @flow
const R = require('ramda')
const pg = require('pg')

const query = (connection_string: string, query_template:string, params: Object) => new Promise((resolve, reject) => {

  var query = query_template

  const add_date_trunc_params = (param_name : string) => {
      const param_value = params[param_name]
      params[`f_${param_name}`] = (table: string, day_column: string) => 
        (!param_value || param_value == '-') ? `'-'`
        : param_value == 'hour'  ? `date_trunc('hour', CONVERT_TIMEZONE('UTC', '${-1 * parseFloat(params.timezone)}', ${table}.${day_column})) :: timestamp AT TIME ZONE '${-1 * parseFloat(params.timezone)}'`
        : param_value == 'day'   ? `date_trunc('day', CONVERT_TIMEZONE('UTC', '${-1 * parseFloat(params.timezone)}', ${table}.${day_column})) :: timestamp AT TIME ZONE '${-1 * parseFloat(params.timezone)}'`
        : param_value == 'week'  ? `date_trunc('week', CONVERT_TIMEZONE('UTC', '${-1 * parseFloat(params.timezone)}', ${table}.${day_column})) :: timestamp AT TIME ZONE '${-1 * parseFloat(params.timezone)}'`
        : param_value == 'month' ? `date_trunc('month', CONVERT_TIMEZONE('UTC', '${-1 * parseFloat(params.timezone)}', ${table}.${day_column})) :: timestamp AT TIME ZONE '${-1 * parseFloat(params.timezone)}'`
        : `coalesce(${table}.${param_value}, 'Unknown')`

      return params
  }

  params = add_date_trunc_params('page')
  params = add_date_trunc_params('section')
  params = add_date_trunc_params('row')

  params.from_date_tz = `CONVERT_TIMEZONE('${-1 * parseFloat(params.timezone)}', '0', '${params.from_date}')`
  params.to_date_tz = `CONVERT_TIMEZONE('${-1 * parseFloat(params.timezone)}', '0', '${params.to_date}')`

  params.f_filter = (table: string) => (
    x => !x 
    ? 'true' 
    : R.compose(
          R.join(' and ')
        , R.map(([k, v]) => R.compose(
              x => `(${x})`
            , R.join(' or ')
            , R.map(v => `${table}.${k}='${v}'`)
            , R.split(';'))(v)
          )
        , R.splitEvery(2)
        , R.split(',')
      )(x)
    )(params.filter)

  R.keys(params).forEach(key => {
    const reg = new RegExp(`\\$${key}\\$`, 'g')
    query = query.replace(reg, params[key])
  })

  query = query.replace(/\$\[(.*)\]\$/ig, (_, match) => {
    return eval(match)
  })

  const client = new pg.Client(connection_string)

  client.connect((err, conn, done) => {
    if(err) {
      client.end();
      reject(err)
    }
    console.info('---------', 'conn.processID = ', conn.processID, '---------')
    console.info(query)
    console.info('---------')
    client.query(query)
    .then(x =>  { client.end(); resolve(x) })
    .catch(x => { client.end(); reject(x) })
  })
})

module.exports = query
