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
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
passport.use(new LocalStrategy((username, password, callback) => {
  console.log(username, password)
  if(
         (username == 'homam' && password == 'duck')
      || (username == 'sam-media' && password == 'dashsam42')
   ) {
    return callback(null, {username})
  } else {
    return callback("Invalid username or password", false)
  }
}))

passport.serializeUser((user, callback) => callback(null, user.username))
passport.deserializeUser((username, callback) => callback(null, {username}))
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.post('/api/login',
    passport.authenticate('local', { failWithError: true })
  , (req, res, next) => {
      // success
      req.login(req.user, () => {
        res.cookie('username', req.user.username , { maxAge: 3600 * 24 * 30, path: '/', httpOnly: true })
        res.end(JSON.stringify({success: true}))
      })
    }
  , (err, req, res, next) => {
      // failure
      res.end(JSON.stringify({success: false}))
    }
)

app.use((req, res, next) => {
  // try logging in by cookie
  const login = (username, callback) => {
    req.login({username: username}, () => {
      res.cookie('username', req.user.username , { maxAge: 3600 * 24 * 30, path: '/', httpOnly: true })
      if(!!callback)
        callback()
      else
        next()
    })
  }
  if(req.isAuthenticated()) {
    next()
  } else if(!!req.cookies && !!req.cookies.username) {
    login(req.cookies.username)
  } else if(!!req.query.username && !!req.query.hash) {
    const { encrypt, decrypt } = require('./auth')
    if(decrypt(req.query.hash) == req.query.username) {
      // TODO: improve redirection by just removing username and hash from query string not all query params
      login(req.query.username, () => res.redirect(req.originalUrl.split('?')[0]))
    }
  } else {
    next()
  }
})

app.post('/api/is_loggedin', (req, res) => {
  if(!!req.user) {
    const {username} = req.user
    res.end(JSON.stringify({ success: true, username }))
  } else {
    res.end(JSON.stringify({ success: false }))
  }
})

app.use((req, res, next) => {
  if(!req.isAuthenticated()) {
    res.redirect('/')
  } else {
    next()
  }
})

// end login

const respond = (sql, params, res, map = x => x) => {
  res.set('Content-Type', 'text/json')
  res.set('Cache-Control', 'public, max-age=7200')
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

app.use('/*', express.static('dist'))

const port = process.env.PORT || 3081
app.listen(port)
console.log(`app started at port ${port}`)
