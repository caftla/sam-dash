// @flow

const jwt = require('jsonwebtoken')
const passport = require('passport')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const LdapStrategy = require('passport-ldapauth')
const ActiveDirectory = require('activedirectory')

// options
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([ExtractJwt.fromHeader('authorization'), ExtractJwt.fromUrlQueryParameter('token')]),
  secretOrKey: process.env.secret,
  ignoreExpiration: false,
}

const LDAPconfig = {
  server: {
    url: 'ldaps://ldap.sam-media.com',
    searchBase: 'ou=user,dc=sam-media,dc=com',
    searchFilter: '(mail={{username}})'
  },
}

const activeDirectoryConfig = {
  url: 'ldaps://ldap.sam-media.com',
  baseDN: 'ou=user,dc=sam-media,dc=com',
}

const ad = new ActiveDirectory(activeDirectoryConfig)

const userExists = username => new Promise((resolve, reject) => {
  ad.userExists({ filter: `mail=${username}` }, username, (err, exists) => {
    if (err) {
      reject(false)
    }
    if (!exists) {
      console.log(username + ' exists: ' + exists)
      reject(false)
    }
    if (exists) {
      console.log(username + ' exists: ' + exists)
      resolve(true)
    }
  })
})

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

const validateSignature = (x, y) => x === y
const validateExpiry = e => e >= new Date().valueOf()

const token = user => jwt.sign(
  { username: user }
  , jwtOptions.secretOrKey
  , { expiresIn: '1m' }
)

const checkLdapPayload = (email, done) => {
  if (typeof email !== 'undefined') {
    return done(null, email)
  }
  return done('fail', null)
}

passport.use(
  new LdapStrategy(LDAPconfig,
    (payload, done) => {
      console.log('LDAP authentication started')      
      checkLdapPayload(payload.mail, (err, user) => {
        if (err) {
          return done(err)
        }
        if (!user) {
          return done(null, false, { message: 'incorrect username' })
        }
        return done(null, user)
      })
    },
  ),
)

passport.use(
  new JwtStrategy(jwtOptions,
    (payload, done) => {
      console.log('jwt authentication started')
      checkLdapPayload(payload.username, (err, user) => {
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
  const requireSignin = passport.authenticate('ldapauth', { session: false })
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
      const dir = req.url.substr(0, req.url.lastIndexOf('/'))
      const { username, exp_ts, hash } = req.query
      const signature = sign(username, exp_ts, process.env.secret)
      
      const isValidated = validateSignature(signature, hash)
      console.log(isValidated)
      
      const notExpired = validateExpiry(exp_ts)
      console.log(notExpired)

      if (isValidated && notExpired) {
        userExists(username)
          .then(x => x ?
            res.redirect(base + '?token=' + token(username))
          : res.redirect(base)
          )
          .catch(x => !x ?
            res.redirect(base)
          : res.redirect(base)
          )
      } else {
        res.redirect(base)
      }
    } else {
      next()
    }
  })

  app.post('/api/login',
    requireSignin,
    (req, res, next) => {
        // success
      const username = req.body.username
      res.end(JSON.stringify({ success: true, token: token(username) }))
    }
    , (err, req, res, next) => {
        // failure
      res.end(JSON.stringify({ success: false }))
    },
  )

  app.post('/api/is_loggedin',
    (req, res) => {
      const recievedToken = req.headers.authorization
      jwt.verify(recievedToken, process.env.secret, (err, decode) => {
        if (err) {
          if (err.name === 'TokenExpiredError') {
            const decoded = jwt.decode(recievedToken, { json: true })
            console.log('Token expired , username:', decoded)
            userExists(decoded.username)
              .then(x => x ?
                res.end(JSON.stringify({ success: x, token: token(decoded.username) }))
              : res.end(JSON.stringify({ success: x, err: err }))
              )
              .catch(x => !x ?
                res.end(JSON.stringify({ success: x, err: err }))
              : res.end(JSON.stringify({ success: x, err: err }))
              )
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
