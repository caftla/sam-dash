// @flow

const jwt = require('jwt-simple')
const userModel = require('./userModel.js').user
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const LocalStrategy = require('passport-local').Strategy

passport.serializeUser((user, callback) => callback(null, user.email))
passport.deserializeUser((email, callback) => {
  userModel.getUserByEmail(email, (err, obj) => {
    callback(err, obj)
  })
})

const token = (user) => {
  const timestamp = new Date().getTime()
  return jwt.encode({ username: user, createdAt: timestamp }, 'dashman')
}

passport.use(
  new LocalStrategy(
    (username, password, done) => {
      userModel.getUserByEmail(username, (err, obj) => {
        if (err) {
          return done(err)
        }
        if (!obj) {
          return done(null, false, { message: 'incorrect email!' })
        }
        if (!userModel.compareUser(obj, password)) {
          return done(null, false, { message: 'incorrect password' })
        }
        return done(null, obj)
      })
    },
  ),
)

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromHeader('authorization'),
      secretOrKey: 'dashman',
    },
    (payload, done) => {
      console.log('jwt authentication started')
      console.log(payload)
      userModel.getUserByEmail(payload.username, (err, obj) => {
        if (err) {
          return done(err)
        }
        if (!obj) {
          return done(null, false, { message: 'incorrect email!' })
        }
        return done(null, obj)
      })
    },
  ),
)

module.exports = (app) => {
  const requireSignin = passport.authenticate('local', { failwitherror: true })
  const requireAuth = passport.authenticate('jwt', { session: false })

  app.use(passport.initialize())
  app.use(passport.session())

  app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', '*')
    res.set(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    )
    next()
  })

  app.post('/api/login',
    requireSignin,
    (req, res, next) => {
        // success
      const username = req.user.email
      console.log(username)
      res.end(JSON.stringify({ success: true, token: token(username) }))
    }
    , (err, req, res, next) => {
        // failure
      res.end(JSON.stringify({ success: false }))
    },
  )

  // app.use((req, res, next) => {
  //   // try logging in by cookie
  //   const login = (username, callback) => {
  //     req.login({username: username}, () => {
  //       res.cookie('username', req.user.username , { expires: new Date(new Date().valueOf() + 1000 * 3600 * 24 * 30), path: '/', httpOnly: true })
  //       if(!!callback)
  //         callback()
  //       else
  //         next()
  //     })
  //   }
  //   if(req.isAuthenticated()) {
  //     next()
  //   } else if(!!req.cookies && !!req.cookies.username) {
  //     login(req.cookies.username)
  //   } else if(!!req.query.username && !!req.query.hash) {
  //     if(decrypt(req.query.hash) == req.query.username) {
  //       // TODO: improve redirection by just removing username and hash from query string not all query params
  //       login(req.query.username, () => res.redirect(req.originalUrl.split('?')[0]))
  //     }
  //   } else {
  //     next()
  //   }
  // })

  app.post('/api/is_loggedin', requireAuth,
    (req, res, next) => {
      res.end(JSON.stringify({ success: true }))
    },
    (err, req, res, next) => {
      res.end(JSON.stringify({ success: false }))
    },
  )
  return () => requireAuth
}
