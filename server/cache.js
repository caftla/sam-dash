const hash = require('object-hash')
const Redis = require('ioredis')

const client = new Redis({
  retryStrategy: function (times) {
    var delay = Math.min(times * 50, 2000);
    console.log('reconnecting', times)
    return times > 10 ? false : delay;
  }
});


const cache_get = (ttl, f, ...params) => {
  const paramsHash = hash(params)
  return client.get(paramsHash)
    .catch(x => console.log('*** - redis connection error', x))
    .then(x => !!x ? JSON.parse(x) : f(...params))
    .then(x => x)
}

const cache_set = (ttl, x, ...params) => {
  const paramsHash = hash(params)
  client.set(paramsHash, JSON.stringify(x), 'EX', ttl)
}

module.exports = {
  cache_get,
  cache_set
}
