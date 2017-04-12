// @flow
const express = require('express');
const app = express();
const query = require('./sql-api')
const fs = require('fs')
const R = require('ramda')

const respond = (sql, params, res, map = x => x) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Content-Type', 'text/json')
  query(sql, params)
  .then(x => res.end(JSON.stringify(map(x.rows))))
  .catch(x => {
    console.error(x)
    res.set('status', 500)
    res.end(`Error:\n${x.toString()}`)
  })
}

app.get('/api/query', (req, res) => {
  respond(fs.readFileSync('./server/query.sql', 'utf8'), req.query, res)
})

app.get('/api/countries', (req, res) => {
  respond(`select distinct(code) as country from ss_locations order by code`, {}, res, xs => xs.map(x => x.country))
})

app.use(express.static('dist'))

const filter_to_pipe_syntax = x => x == '-' ? '' : R.pipe(
    R.split(',')
  , R.map(R.pipe(R.split('='), R.map(x => x.trim())))
  , R.map(R.join(','))
  , R.join(',')
)(x)

// example: http://127.0.0.1:3081/api/v1/filter_section_row/2017-04-01/2017-04-07/country_code=ZA,affiliate_name=Gotzha/publisher_id/day
app.get('/api/v1/filter_section_row/:from_date/:to_date/:filter/:section/:row', (req, res) => {
  const params = R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) })
  respond(
      fs.readFileSync('./server/sql-templates/filter_section_row/index.sql', 'utf8')
    , params
    , res
    , require('./sql-templates/filter_section_row')(params)
  )
})

app.get('/api/v1/all_countries/:from_date/:to_date', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Content-Type', 'text/json')
  return res.end(fs.readFileSync('./server/sql-templates/all_countries/result.json', 'utf8'))
  respond(
      fs.readFileSync('./server/sql-templates/all_countries/index.sql', 'utf8')
    , req.params
    , res
    , x => x
  )
})

app.use('/*', express.static('dist'))

app.listen(process.env.PORT || 3081);
