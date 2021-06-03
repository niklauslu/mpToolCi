/**
 * MpToolCI
 * 小程序ci工具
 */

const ci = require("miniprogram-ci")
const fs = require("fs")
const path = require('path')

class MpToolCI {
  constructor(opt = {}) {
    this.appid = opt.appid || ''
    this.privatekeyPath = opt.privatekeyPath || ''
    this.projectPath = opt.projectPath || ''

    this.project = null
    // this._getProject(opt.appid, opt.projectPath)
  }

  /**
   * 获取上传项目对象
   * @param {*} appid 
   * @param {*} projectPath 
   */
  initProject(projectPath = '') {
    let appid = this.appid || ''
    projectPath = projectPath || this.projectPath || ''
    if (!appid) {
      return {code: 1, message: 'appid错误'}
    }
    let privatekeyPath = path.join(this.privatekeyPath,`private.${appid}.key`);
    if (!fs.existsSync(privatekeyPath)) {
      return {code: 1, message: '上传秘钥配置错误'}
    }
    console.log("MpToolCI initProject privatekeyPath:" + privatekeyPath);
    if (!fs.existsSync(projectPath)) {
      return {code: 1, message: '项目文件夹获取错误'}
    }
    
    let project = new ci.Project({
      appid: appid,
      type: "miniProgram",
      projectPath: projectPath,
      privateKeyPath: privatekeyPath,
      ignores: ["node_modules/**/*"],
    });

    this.project = project
    return {code: 0 , data: project}

  }

  /**
   * 预览
   * @param {*} robotNo 
   * @param {*} desc 
   * @returns 
   */
  async preview(robotNo = 1, outPreviewPath,  desc = "" , logger = null, requestId = "") {
    let project = this.project
    // let appid = this.appid
    let options = {
      project,
      desc: desc,
      setting: {
        es6: true
      },
      qrcodeFormat: "base64",
      qrcodeOutputDest: outPreviewPath,
      robot: robotNo,
    }

    if (logger) {
      // 自定义log
      options.onProgressUpdate = (args) => {
        logger.info(requestId, args)
      }
    }

    let result = await ci.preview(options)
    return result
  }

 
}

module.exports = MpToolCI