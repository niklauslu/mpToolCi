/**
 * Redis
 */

const redis = require('redis')

class Redis {

  constructor(opt = {}) {
    let host = opt.host || '127.0.0.1'
    let port = opt.port || 6379

    let client = redis.createClient(port, host);

    // 配置redis的监听事件
    // 准备连接redis-server事件
    client.on('ready', function () {
      console.log('Redis client: ready');
    });

    // 连接到redis-server回调事件
    client.on('connect', function () {
      console.log(new Date(), 'redis is now connected!');
    });

    client.on('reconnecting', function () {
      console.log(new Date(), 'redis reconnecting', arguments);
    });

    client.on('end', function () {
      console.log('Redis Closed!');
    });

    client.on('warning', function () {
      console.log('Redis client: warning', arguments);
    });

    client.on('error', function (err) {
      console.error('Redis Error ' + err);
    });

    this.client = client
  }


  /**
   * redis setString function
   * @param key
   * @param value
   * @param expire
   */
  setString = (key, value, expire) => {
    let redisClient = this.client
    return new Promise((resolve, reject) => {
      redisClient.set(key, value, function (err, result) {

        if (err) {
          console.warn(err);
          reject(err);
        }

        if (!isNaN(expire) && expire > 0) {
          client.expire(key, parseInt(expire));
        }
        resolve(result);
      });
    });
  };

  /**
* redis getString function
* @param key
*/
  getString = (key) => {
    let redisClient = this.client
    return new Promise((resolve, reject) => {
      redisClient.get(key, function (err, result) {
        if (err) {
          console.warn(err);
          reject(err);
        }
        resolve(result);
      });
    });
  };


  /**
  * redis removeString function
  * @param key
  */
  removeString = (key) => {
    let redisClient = this.client
    return new Promise((resolve, reject) => {
      redisClient.get(key, function (err, result) {
        if (err) {
          console.warn(err);
          reject(err);
        }
        client.expire(key, parseInt(-1));
        resolve(result);
      });
    });
  };
}

module.exports = Redis