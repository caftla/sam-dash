// @flow
const R = require('ramda')
const pg = require('pg')
const connectionString = process.env.connection_string

const query = (query_template:string, params: any) => new Promise((resolve, reject) => {

  var query = query_template

  R.keys(params).forEach(key => {
    const reg = new RegExp(`\\$${key}\\$`, 'g')
    query = query.replace(reg, params[key])
  })

  query = query.replace(/\$\[(.*)\]\$/ig, (_, match) => {
    return eval(match)
  })

  const client = new pg.Client(connectionString)

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
