// @flow
const express = require('express');
const query = require('./sql-api')
const fs = require('fs')
const R = require('ramda')
const query_monthly_reports = require('./sql-templates/monthly_reports')

const app = express();
app.use(express.static('dist'))
app.use(require('cookie-parser')());
// app.use(require('express-session')({secret: 'secret-dash'}));

app.use(require('body-parser')());

app.post('/api/v1/run_query', (req, res) => {
  req.rawBody = '';
  req.setEncoding('utf8');

  req.on('data', function(chunk) { 
    req.rawBody += chunk;
  });

  req.on('end', function() {
    res.end(req.rawBody)
    // respond_jewel(req.rawBody, {}, res)
  })
})

app.use((req, res, next) => {
  if('sam-media' == req.query.username  && '37b90bce2765c2072c' == req.query.hash) {
    const base = req.url.split('?')[0]
    const params = R.pipe(
      R.toPairs
    , R.reject(([k, v]) => k == 'username' || k == 'hash')
    , R.map(R.join('='))
    , R.join('&')
    )(R.merge(
      {token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InN0YWZmQHNhbS1tZWRpYS5jb20iLCJjcmVhdGVkQXQiOjE0OTk2OTE2NTYzNDJ9.i7ekGnl9gZM6iUBPsvYkKcZA1agNbjzUf2Txi7mNqxw'}
      , req.query))
    return res.redirect(base + '?' + params)
  }
  next();
})



// login
const authenticate = require('./auth')(app)

const connection_strings = {
    helix_connection_string: process.env['helix_connection_string']
  , jewel_connection_string: process.env['jewel_connection_string']
}

const respond = (connection_string: string, sql, params, res, map = x => x) => {
  query(connection_string, sql, params)
  .then(x => {
    res.set('Content-Type', 'text/json')
    res.set('Cache-Control', 'public, max-age=7200')
    res.end(JSON.stringify(map(x.rows)))
  })
  .catch(x => {
    console.error(x)
    res.status(500)
    res.end(`Error:\n${x.toString()}`)
  })
}

const respond_with_connection_name = (connection_name: string, sql, params, res, map = x => x) => {
  const connection_string = connection_strings[connection_name]
  if(connection_string == null) {
    res.status(500)
    res.end(`Error:\n${connection_name} env variable is not provided.`)
  }
  else respond(connection_string, sql, params, res, map)
}

const respond_helix = (sql, params, res, map = x => x) => respond_with_connection_name('helix_connection_string', sql, params, res, map)
const respond_jewel = (sql, params, res, map = x => x) => respond_with_connection_name('jewel_connection_string', sql, params, res, map)


app.get('/api/query', (req, res) => {
  respond_helix(fs.readFileSync('./server/query.sql', 'utf8'), req.query, res)
})

app.get('/api/countries', (req, res) => {
  respond_helix(`select distinct(code) as country from ss_locations order by code`, {}, res, xs => xs.map(x => x.country))
})

const filter_to_pipe_syntax = x => x == '-' ? '' : R.pipe(
    R.split(',')
  , R.map(R.pipe(R.split('='), R.map(x => x.trim())))
  , R.reject(x => x.length != 2)
  , R.map(R.join(','))
  , R.join(',')
)(x)

app.get('/api/hello', authenticate(), (req, res) => {
  // console.log(req.cookies)
  // res.end('hello ' + req.user + ' ' + req.isAuthenticated())
  res.send(200)
},
  (err, req, res) => {
    res.send(401)
  },
)

// example: http://127.0.0.1:3081/api/v1/filter_section_row/2017-04-01/2017-04-07/country_code=ZA,affiliate_name=Gotzha/publisher_id/day
app.get('/api/v1/filter_section_row/:from_date/:to_date/:filter/:section/:row', authenticate(), (req, res) => {
  const params = R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) })
  respond_helix(
      fs.readFileSync('./server/sql-templates/filter_section_row/index.sql', 'utf8')
    , params
    , res
    , require('./sql-templates/filter_section_row')(params)
  )
})

app.get('/api/v1/filter_page_section_row/:timezone/:from_date/:to_date/:filter/:page/:section/:row', authenticate(), (req, res) => {
  const params = R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) })
  respond_jewel(
      fs.readFileSync('./server/sql-templates/filter_page_section_row/index.sql', 'utf8')
    , params
    , res
    , require('./sql-templates/filter_page_section_row')(params)
  )
})

app.get('/api/v1/filter_page_section_row/flat/:timezone/:from_date/:to_date/:filter/:page/:section/:row', authenticate(), (req, res) => {
  const params = R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) })
  respond_jewel(
      fs.readFileSync('./server/sql-templates/filter_page_section_row/index.sql', 'utf8')
    , params
    , res
    , require('./sql-templates/filter_page_section_row/flat')(params)
  )
})

app.get('/api/v1/all_countries/:from_date/:to_date', (req, res) => {
  respond_helix(
      fs.readFileSync('./server/sql-templates/all_countries/index.sql', 'utf8')
    , req.params
    , res
    , x => x
  )
})

app.get('/api/v1/cohort/:from_date/:to_date/:filter', authenticate(), (req, res) => {
  const params = R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) })
  respond_helix(
      fs.readFileSync('./server/sql-templates/cohort/index.sql', 'utf8')
    , params
    , res
    , require('./sql-templates/cohort')(params)
  )
})

app.get('/api/v1/all_affiliates', (req, res) => {
  respond_jewel(`select * from affiliate_mapping`, {}, res, R.pipe(
      R.groupBy(x => x.affiliate_name)
    , R.map(R.map(x => x.affiliate_id))
    , R.toPairs
    , R.map(([affiliate_name, affiliate_ids]) => ({affiliate_name, affiliate_ids}))
  ))
})

app.get('/api/v1/converting_ips/:from_date/:to_date/:filter', authenticate(), (req, res) => {
  const params = R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) })
  respond_jewel(
      fs.readFileSync('./server/sql-templates/converting_ips/index.sql', 'utf8')
    , params
    , res
    , require('./sql-templates/converting_ips')(params))
})

app.get('/api/v1/traffic_breakdown/:from_date/:to_date/:filter', authenticate(), (req, res) => {
  const params = R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) })
  respond_jewel(
      fs.readFileSync('./server/sql-templates/traffic_breakdown/index.sql', 'utf8')
    , params
    , res
  )
})

app.get('/api/v1/monthly_reports/:from_date/:to_date/:filter', authenticate(), (req, res) => {
  const params = R.merge(req.params, { filter: filter_to_pipe_syntax(req.params.filter) })

  const helix_connection_string = connection_strings.helix_connection_string
  const jewel_connection_string = connection_strings.jewel_connection_string
  if(helix_connection_string == null) {
    res.status(500)
    res.end(`Error:\nhelix_connection_string env variable is not provided.`)
  } else if(jewel_connection_string == null) {
    res.status(500)
    res.end(`Error:\njewel_connection_string env variable is not provided.`)
  } else {
    query_monthly_reports(helix_connection_string, jewel_connection_string, params)
    .then(data => {
      res.set('Content-Type', 'text/json')
      res.set('Cache-Control', 'public, max-age=7200')
      res.json(data)
    })
    .catch(ex => {
      res.status(500)
      res.end(ex.toString())
    })
  }
})

app.use('/*', express.static('dist'))

const port = process.env.PORT || 3081
app.listen(port)
console.log(`app started at port ${port}`)
