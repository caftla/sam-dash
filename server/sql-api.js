// @flow
const R = require('ramda')
const pg = require('pg')

const query = (connection_string: string, query_template:string, params: Object) => new Promise((resolve, reject) => {

  var query = query_template

  const add_date_trunc_params = (param_name : string) => {
      const param_value = params[param_name]
      params[`f_${param_name}`] = (table: string, day_column: string) => param_value == 'day' ? `${table}.${day_column}`
        : param_value == 'week' ? `date_trunc('week', ${table}.${day_column}) :: TIMESTAMP WITHOUT TIME ZONE`
        : param_value == 'month' ? `date_trunc('month', ${table}.${day_column}) :: TIMESTAMP WITHOUT TIME ZONE`
        : `coalesce(${table}.${param_value}, 'Unknown')`

      return params
  }

  params = add_date_trunc_params('page')
  params = add_date_trunc_params('section')
  params = add_date_trunc_params('row')

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
    client.query(query)
    .then(x =>  { client.end(); resolve(x) })
    .catch(x => { client.end(); reject(x) })
  })
})

module.exports = query
