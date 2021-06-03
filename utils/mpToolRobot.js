class MpToolRobot {
   /**
   * 获取空闲的机器人no
   * @returns 
   */
    getFreeRobotNo(robots) {
      let index = robots.indexOf(0)
      return index + 1
    }
  
    /**
     * 设置锁住的机器人
     * @param {*} i 
     */
    setLockRobot(robots, i) {
      robots[i] = 1
      return robots
    }
  
    /**
     * 解锁机器人
     * @param {*} i 
     * @returns 
     */
    setUnlockRobot(robots, i) {
      robots[i] = 0
      return robots
    }
}

module.exports = new MpToolRobot