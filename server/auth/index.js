module.exports = (app) => {
  const passport = require('passport')
  const LocalStrategy = require('passport-local').Strategy
  const { encrypt, decrypt } = require('./crypt.js')

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
          res.cookie('username', req.user.username , { expires: new Date(new Date().valueOf() + 1000 * 3600 * 24 * 30), path: '/', httpOnly: true })
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
        res.cookie('username', req.user.username , { expires: new Date(new Date().valueOf() + 1000 * 3600 * 24 * 30), path: '/', httpOnly: true })
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
      res.status(401)
      if(req.originalUrl.startsWith('/api/')) {
        res.json({ error: 'access denied' })
      } else {
        res.redirect(`/?login_redir=${encodeURIComponent(req.originalUrl)}`)
      }
    } else {
      next()
    }
  })
}
