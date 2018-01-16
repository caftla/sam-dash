const validate = {}

validate.signature = (x, y) => x === y

validate.expiry = e => e >= new Date().valueOf()

validate.sign = (username, exp, secret) => {
  const str = username.concat(exp, secret)
  const h = [0x6295c58d, 0x62b82555, 0x07bb0102, 0x6c62272e]
  for (let i = 0; i < str.length; i++) {
    h[i % 4] ^= str.charCodeAt(i)
    h[i % 4] *= 0x01000193
  }
    /* returns 4 concatenated hex representations */
  return h[0].toString(16) + h[1].toString(16) + h[2].toString(16) + h[3].toString(16);
}

validate.checkProfilePayload = (profile, done) => {
  if (profile._json.domain == 'sam-media.com') {
    return done(null, profile)
  }
  return done('no user found', null)
}

validate.checkPayload = (email, done) => {
  if (typeof email !== 'undefined') {
    return done(null, email)
  }
  return done('fail', null)
}

module.exports = {
  validate,
}
