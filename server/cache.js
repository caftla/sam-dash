const hash = require('object-hash')
const Redis = require('ioredis');
const client = new Redis({
  retryStrategy: function (times) {
    var delay = Math.min(times * 50, 2000);
    console.log('reconnecting', times)
    return times > 10 ? false : delay;
  }
});

module.exports = (ttl, f, ...params) => {
  const paramsHash = hash(params)
  return client.get(paramsHash)
  .catch(x => console.log('*** - redis connection error', x))
  .then(x => !!x ? JSON.parse(x) : f(...params).then(x => { client.set(paramsHash, JSON.stringify(x), 'EX', ttl); return x; }))
}