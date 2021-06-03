const MpToolRobot = require('./../utils/mpToolRobot')
const Logger = require('./../utils/log')


/**
 * 基础controller
 */
class BaseController {

  constructor() {
    this.logger = Logger("code_server")
  }
  
 /**
   * 查找空闲的机器人
   * @param {*} ctx 
   * @param {*} appid 
   * @returns 
   */
  async _getFreeRobot(ctx, appid) {
    let robots = await this._getRobotsFromRedis(ctx, appid)
    this.logger.info(ctx.requestId, "/_getFreeRobot robots", robots , appid)
    let robotNo = MpToolRobot.getFreeRobotNo(robots)
    return robotNo
  }

  /**
   * 锁定机器人
   * @param {*} ctx 
   */
   async _lockRobot(ctx, appid, robotNo) {
    let robots = await this._getRobotsFromRedis(ctx, appid)
    robots = MpToolRobot.setLockRobot(robots, robotNo - 1)
    return await this._setRobotsToRedis(ctx, appid, robots)
  }

  /**
   * 解锁机器人
   * @param {*} ctx 
   * @param {*} robotNo 
   */
  async _unlockRobot(ctx, appid, robotNo) {
    let robots = await this._getRobotsFromRedis(ctx, appid)
    this.logger.info(ctx.requestId, "/_unlockRobot _unlockRobot", robots)
    robots = MpToolRobot.setUnlockRobot(robots, robotNo - 1)
    this.logger.info(ctx.requestId, "/_unlockRobot robots", robots)
    await this._setRobotsToRedis(ctx, appid, robots)
  }

  /**
   * 从redis获取机器人数据
   * @param {*} ctx 
   * @param {*} appid 
   * @returns 
   */
  async _getRobotsFromRedis(ctx, appid) {
    let key = `mpToolCIRobots_${appid}`
    let robotsStr = await ctx.redisClient.getString(key)
    this.logger.info(ctx.requestId, "/_getRobotsFromRedis robotsStr", robotsStr)
    if (!robotsStr) {
      let robotsArr = []
      for (let index = 0; index < 30; index++) {
        robotsArr.push(0)
      }
      await ctx.redisClient.setString(key, JSON.stringify(robotsArr))
      robotsStr = await ctx.redisClient.getString(key)
    }
    let robots = robotsStr ? JSON.parse(robotsStr) : []
    return robots
  }

  /**
   * 机器人数据保存到redis
   * @param {*} ctx 
   * @param {*} appid 
   * @param {*} robots 
   * @returns 
   */
  async _setRobotsToRedis(ctx, appid, robots) {
    let key = `mpToolCIRobots_${appid}`
    let robotsStr = JSON.stringify(robots)
    this.logger.info(ctx.requestId, "/_setRobotsToRedis robotsStr", robotsStr)
    let ret = await ctx.redisClient.setString(key, robotsStr)
    return ret
  }

}

module.exports = BaseController