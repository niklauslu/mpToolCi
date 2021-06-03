
const path = require('path')

const BaseController = require('./base')
const MpToolCI = require('./../utils/mpToolCi')
const FileUtils = require('./../utils/file')
const config = require('./../config')
const fs = require('fs')
const ZipUtils = require('./../utils/zip')
const ciLogger = require('./../utils/log')('ci')

/**
 * 小程序开发者工具CI
 */
class MpDevToolCI extends BaseController {

  constructor() {
    super()
  }
  /**
   * 预览接口
   * @param {*} ctx 
   */
  async preview(ctx) {
    let appid = ctx.request.body.appid || ''
    let codePath = ctx.request.body.codePath || ''
    let desc = ctx.request.body.desc || '' // 添加一个desc参数

    // 查找上传机器人
    let robotNo = await this._getFreeRobot(ctx, appid)
    this.logger.info(ctx.requestId, "/preview robotNo", robotNo)
    if (robotNo <= 0) {
      ctx.body = { code: 0, message: "ci机器人无空闲，请稍后再试" }
      return
    }

    let mpToolCi = new MpToolCI({
      appid: appid,
      privatekeyPath: config.privatekeyPath
    })

    // 下载文件
    let downRet = await this._downloadFile(ctx, appid)
    if (downRet.code != 0) {
      ctx.body = { code: downRet.code, message: downRet.message }
      return
    }

    let projectPath = downRet.data.projectPath
    this.logger.info(ctx.requestId, "/preview projectPath", projectPath)
    let outPreviewPath = downRet.data.outPreviewPath
    // let filename = downRet.data.fileName
    let saveZipPath = downRet.data.saveZipPath
    let saveFolder = downRet.data.saveFolder

    // 初始化项目
    let initRet = mpToolCi.initProject(projectPath)
    this.logger.info(ctx.requestId, "/preview initRet", initRet.code)
    if (initRet.code != 0) {
      ctx.body = { code: initRet.code, message: initRet.message }
      return
    }

    // 上传预览
    let upErr = null
    try {
      // 锁定机器人
      await this._lockRobot(ctx, appid, robotNo)
      // 先删除旧的
      if (fs.existsSync(outPreviewPath)) {
        fs.unlinkSync(outPreviewPath)
      }
      let previewRet = await mpToolCi.preview(robotNo, outPreviewPath, desc, ciLogger, ctx.requestId)
      this.logger.info(ctx.requestId, "/preview previewRet", JSON.stringify(previewRet))

      if (!previewRet.hasOwnProperty("subPackageInfo")) {
        throw new Error(previewRet.errMsg || "上传失败");
      }

    } catch (err) {
      upErr = err
    }

    this._unlockRobot(ctx, appid, robotNo)
    FileUtils.deleteFolder(saveFolder)
    fs.unlinkSync(saveZipPath)

    if (upErr) {
      ctx.body = { code: -1, message: upErr.message || '上传失败' }
    } else {
      // let url = `${config.host}/${filename}.png`;  // 使用base64不需要url
      let imageData = fs.readFileSync(outPreviewPath, 'utf-8')
      fs.unlinkSync(outPreviewPath)

      ctx.body = {
        code: 0,
        message: "success",
        data: {
          appid,
          codePath,
          robotNo,
          previewPath: imageData
          // previewRet
        }
      }
    }

    return

  }




  /**
   * 下载文件
   * @param {*} ctx 
   */
  async _downloadFile(ctx, appid) {
    let appTempPath = path.join(config.tempPath, appid)
    if (!fs.existsSync(appTempPath)) {
      fs.mkdirSync(appTempPath)
    }

    let previewPath = config.previewPath
    if (!fs.existsSync(previewPath)) {
      fs.mkdirSync(previewPath)
    }

    let codePath = ctx.request.body.codePath || ''
    let filePath = FileUtils.getUriFile(codePath)
    let fileName = FileUtils.getFileNameWithoutExt(filePath)

    let saveFolder = path.join(appTempPath, fileName)
    let saveZipPath = path.join(appTempPath, filePath)
    this.logger.info(ctx.requestId, "/_downloadFile saveFolder:", saveFolder)
    this.logger.info(ctx.requestId, "/_downloadFile saveZipPath:", saveZipPath)

    let projectPath = path.join(appTempPath, fileName, "web_template")
    this.logger.info(ctx.requestId, "/_downloadFile projectPath:", projectPath)
    try {
      // 下载文件
      await FileUtils.downfileSync(codePath, appTempPath)

      // 创建项目目录
      FileUtils.deleteFolder(projectPath);
      FileUtils.mkdirsSync(projectPath)

      // 解压文件
      let unzipRet = await ZipUtils.unzip(saveZipPath, saveFolder)
      if (!unzipRet) {
        throw new Error("解压小程序文件失败")
      }
    } catch (err) {
      FileUtils.deleteFolder(saveFolder)
      fs.unlinkSync(saveZipPath)
      this.logger.info(ctx.requestId, "/_downloadFile err:", err)
      return { code: 1, message: "下载解压文件失败:" + err.message }
    }

    let outPreviewPath = path.join(previewPath, fileName + '.txt')
    this.logger.info(ctx.requestId, "/_downloadFile outPreviewPath:", outPreviewPath)
    // this.logger.info(ctx.requestId, "/_downloadFile imageData:", imageData)

    return {
      code: 0,
      data: {
        projectPath: projectPath,
        saveZipPath: saveZipPath,
        saveFolder: saveFolder,
        fileName: fileName,
        outPreviewPath: outPreviewPath
      }
    }
  }
}

module.exports = new MpDevToolCI