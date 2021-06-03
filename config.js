const path = require('path')
// const nodeEnv = process.env.NODE_ENV || "develop"

module.exports = {
  // host: process.env.NODE_ENV === 'production' ? 'https://mtd.xgeeklab.com' : "http://10.96.155.202:11111", // 不用了
  privatekeyPath:  process.env.privatekeyPath ? path.join(__dirname, process.env.privatekeyPath): path.join(__dirname, './privatekey'),
  tempPath: process.env.tempPath || path.join(__dirname, './var/temp'),
  previewPath: process.env.previewPath || path.join(__dirname, './var/preview'),
  redis: {
    port: process.env.redis_port || 6379,
    host: process.env.redis_host ||'localhost',
  },
  // 默认的小程序appid
  defaultAppIds : process.env.defaultAppIds ? process.env.defaultAppIds.split(",") : ['wx2e40960c5cfb7723'] 

}