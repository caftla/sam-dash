// @flow

const jwt = require('jsonwebtoken')
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
const googleConfig = require('./google_config')


passport.serializeUser((user, done) => {
  done(null, user)
})

passport.deserializeUser((obj, done) => {
  done(null, obj)
})

const secret = process.env.secret

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromHeader('authorization'), ExtractJwt.fromUrlQueryParameter('token')]),
  secretOrKey: secret,
  ignoreExpiration: false,
}

const validateSignature = (x, y) => x === y
const validateExpiry = e => e >= new Date().valueOf()

const redirectURL = (loginRedir, noLoginRedir) => loginRedir ? loginRedir : noLoginRedir

const token = user => jwt.sign(
  { username: user }
  , jwtOptions.secretOrKey
  , { expiresIn: '7d' }
)

const sign = (username, exp, secret) => {
  const str = username.concat(exp, secret)
  const h = [0x6295c58d, 0x62b82555, 0x07bb0102, 0x6c62272e]
  for (let i = 0; i < str.length; i++) {
    h[i % 4] ^= str.charCodeAt(i)
    h[i % 4] *= 0x01000193
  }
    /* returns 4 concatenated hex representations */
  return h[0].toString(16) + h[1].toString(16) + h[2].toString(16) + h[3].toString(16);
}

const checkProfilePayload = (profile, done) => {
  if (profile._json.domain == 'sam-media.com') {
    return done(null, profile)
  }
  return done('no user found', null)
}

const checkPayload = (email, done) => {
  if (typeof email !== 'undefined') {
    return done(null, email)
  }
  return done('fail', null)
}

passport.use(
  new GoogleStrategy(googleConfig.google,
    (accessToken, refreshToken, profile, done) => {
      checkProfilePayload(profile, (err, user) => {
        if (!user) {
          return done(null, false, { message: 'incorrect username' })
        }
        return done(null, user)
      })
    },
))

passport.use(
  new JwtStrategy(jwtOptions,
    (payload, done) => {
      console.log('jwt authentication started')
      checkPayload(payload.username, (err, user) => {
        if (err) {
          return done(err, null)
        }
        if (!user) {
          return done(null, false, { message: 'incorrect username' })
        }
        return done(null, user)
      })
    },
  ),
)

module.exports = (app) => {
  const requireSignin = passport.authenticate('google', { scope: ['openid email profile'] })
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

  app.use((req, res, next) => {
    if ('undefined' !== typeof req.query.username) {
      const base = req.url.split('?')[0]
      const { username, exp_ts, hash } = req.query
      const signature = sign(username, exp_ts, secret)
      
      const isValidated = validateSignature(signature, hash)
      const notExpired = validateExpiry(exp_ts)
      
      if (isValidated && notExpired) {
        console.log('validated and not expired')
        res.redirect(base + '?token=' + token(username))
      } else {
        console.log('either not validated or not expired')
        res.redirect(base)
      }
    } else {
      next()
    }
  })

  app.get('/api/google_login', requireSignin, (req, res, next) => {
  })

  app.get('/api/google_callback',
    passport.authenticate('google', {
      failureRedirect: `/api/login`
    }),
  (req, res) => {
    // Authenticated successfully
    const user = req.user
    const sessionState = decodeURIComponent(req.headers.referer)
    const parsedSessionState = sessionState.split('login_redir=').pop()
    res.redirect(redirectURL(parsedSessionState, sessionState) + `?token=${token(user.emails[0].value)}`);
  })

  app.post('/api/is_loggedin',
    (req, res) => {
      const recievedToken = req.headers.authorization
      jwt.verify(recievedToken, secret, (err, decode) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            const decoded = jwt.decode(recievedToken, { json: true })
            console.log('Token expired , username:', decoded)
            res.end(JSON.stringify({ success: false, err }))
          } else {
            res.end(JSON.stringify({ success: false, err }))
          }
        } else {
          res.end(JSON.stringify({ success: true }))
        }
      })
    },
    (err, req, res) => {
      res.end(JSON.stringify({ success: false }))
    },
  )
  return () => requireAuth
}
