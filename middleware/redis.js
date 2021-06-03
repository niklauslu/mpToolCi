
/**
 * redis添加到ctx
 */

const RedisClient = require('./../utils/redis')
const conf = require('./../config')
const config = conf.redis
const mpAppIds = conf.defaultAppIds

let redisClient = new RedisClient({
  port: config.port,
  host: config.host
})

// 初始化ci机器人
// let robots = []
// for (let index = 0; index < 30; index++) {
//   robots.push(0)
// }
// redisClient.setString("mpToolCIRobots_wx2e40960c5cfb7723", "").then(ret => {
//   console.log("set mp_tool_ci_robots ret", ret)
// })

// let mpAppIds = ['wx2e40960c5cfb7723']

// 启动项目初始化机器人数据
mpAppIds.forEach(appid => {
  redisClient.client.del(`mpToolCIRobots_${appid}`, (err, ret ) => {
    if (err) {
      console.error(`set mp_tool_ci_robots ${appid} err`, err)
    }
    console.log(`set mp_tool_ci_robots ${appid} ret`, ret)
  })
})

module.exports = () => {
  return async (ctx, next) => {
    ctx.redisClient = redisClient
    await next();
  }
}