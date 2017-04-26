// @flow
const express = require('express');
const query = require('./sql-api')
const fs = require('fs')
const R = require('ramda')

const app = express();
app.use(express.static('dist'))
app.use(require('cookie-parser')());
app.use(require('body-parser')());
app.use(require('express-session')({secret: 'secret-dash'}));

// login
require('./auth')(app)

const respond = (sql, params, res, map = x => x) => {
  res.set('Content-Type', 'text/json')
  res.set('Cache-Control', 'public, max-age=7200')
  query(sql, params)
  .then(x => res.end(JSON.stringify(map(x.rows))))
  .catch(x => {
    console.error(x)
    res.status(500)
    res.end(`Error:\n${x.toString()}`)
  })
}

app.get('/api/query', (req, res) => {
  respond(fs.readFileSync('./server/query.sql', 'utf8'), req.query, res)
})

app.get('/api/countries', (req, res) => {
  respond(`select distinct(code) as country from ss_locations order by code`, {}, res, xs => xs.map(x => x.country))
})

const filter_to_pipe_syntax = x => x == '-' ? '' : R.pipe(
    R.split(',')
  , R.map(R.pipe(R.split('='), R.map(x => x.trim())))
  , R.map(R.join(','))
  , R.join(',')
)(x)

app.get('/api/hello', (req, res) => {
  // console.log(req.cookies)
  res.end('hello ' + req.user + ' ' + req.isAuthenticated())
})

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

app.get('/api/v1/filter_page_section_row/:from_date/:to_date/:filter/:page/:section/:row', (req, res) => {
  const params = R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) })
  respond(
      fs.readFileSync('./server/sql-templates/filter_page_section_row/index.sql', 'utf8')
    , params
    , res
    , require('./sql-templates/filter_page_section_row')(params)
  )
})

app.get('/api/v1/all_countries/:from_date/:to_date', (req, res) => {
  respond(
      fs.readFileSync('./server/sql-templates/all_countries/index.sql', 'utf8')
    , req.params
    , res
    , x => x
  )
})

app.get('/api/v1/cohort/:from_date/:to_date/:filter', (req, res) => {
  const params = R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) })
  respond(
      fs.readFileSync('./server/sql-templates/cohort/index.sql', 'utf8')
    , params
    , res
    , require('./sql-templates/cohort')(params)
  )
})

app.use('/*', express.static('dist'))

const port = process.env.PORT || 3081
app.listen(port)
console.log(`app started at port ${port}`)
