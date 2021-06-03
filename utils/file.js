const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
var request = require("request");
// var exec = require('child_process').exec

class FileUtils {
  deleteFolder(filePath) {
    const files = [];
    if (fs.existsSync(filePath)) {
      const files = fs.readdirSync(filePath);
      files.forEach((file) => {
        const nextFilePath = `${filePath}/${file}`;
        const states = fs.statSync(nextFilePath);
        if (states.isDirectory()) {
          //recurse
          this.deleteFolder(nextFilePath);
        } else {
          //delete file
          fs.unlinkSync(nextFilePath);
        }
      });
      fs.rmdirSync(filePath);
    }
  }

  // 递归创建目录 异步方法
  mkdirs(dirname, callback) {
    fs.exists(dirname, function (exists) {
      if (exists) {
        callback();
      } else {
        // console.log(path.dirname(dirname));
        this.mkdirs(path.dirname(dirname), function () {
          fs.mkdir(dirname, callback);
          console.log(
            "在" + path.dirname(dirname) + "目录创建好" + dirname + "目录"
          );
        });
      }
    });
  }

  // 递归创建目录 同步方法
  mkdirsSync(dirname) {
    if (fs.existsSync(dirname)) {
      return true;
    } else {
      if (this.mkdirsSync(path.dirname(dirname))) {
        fs.mkdirSync(dirname);
        return true;
      }
    }
  }

  readFileList(dir, filesList = []) {
    const files = fs.readdirSync(dir);
    // console.log(files);
    files.forEach((item, index) => {
      var fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        this.readFileList(path.join(dir, item), filesList); //递归读取文件
      } else {
        filesList.push(fullPath);
      }
    });

    return filesList;
  }

  saveHttpImg(imgPath, savePath) {
    return new Promise((r, j) => {
      let request = imgPath.indexOf("https://") > -1 ? https : http;
      request.get(imgPath, (req, res) => {
        let imgData = "";
        req.setEncoding("binary");
        req.on("data", (chunk) => {
          imgData += chunk;
        });
        req.on("end", () => {
          fs.writeFile(savePath, imgData, "binary", (err) => {
            //path为本地路径例如public/logo.png
            if (err) {
              console.log("saveHttpImg err:", err);
              r(false);
            } else {
              r(true);
            }
          });
        });
      });
    });
  }

  getImgExt(imgPath) {
    let arr = imgPath.split(".");
    return arr[arr.length - 1];
  }

  getFileNameWithoutExt(imgPath) {
    let arr = imgPath.split(".");
    return arr[0];
  }

  getUriFile(url) {
    let arr = url.split("/");
    return arr[arr.length - 1];
  }

  //下载文件
  downfile(url, dirPath, callback) {
    //创建文件夹目录
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
      console.log("文件夹创建成功");
    } else {
      console.log("文件夹已存在");
    }

    //循环多线程下载
    //"url": "https://ceph.xgeeklab.com/test/6f30a4a250403c40fc41365f441aad42.zip"
    console.log("url...", url);
    let fileName = this.getUriFile(url);
    let saveFile = path.join(dirPath, fileName);
    console.log("saveFile..." + saveFile);
    let stream = fs.createWriteStream(saveFile);
    request(url).pipe(stream).on("close", callback);
  }

  // 下载文件异步方法
  downfileSync(url, dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath);
    }

    console.log("/downfileSync url：", url);
    let fileName = this.getUriFile(url);
    let saveFile = path.join(dirPath, fileName);
    console.log("/downfileSync saveFile：" + saveFile);
    let stream = fs.createWriteStream(saveFile);

    return new Promise((r, j) => {
      request(url).pipe(stream).on("close", (err) => {
        if (err) {
          j(err)
        } else {
          r(saveFile)
        }
      })
    })
  }

  //整数转字符串，不足的位数用0补齐
  intToString(num, len) {
    let str = num.toString();
    while (str.length < len) {
      str = "0" + str;
    }
    return str;
  }
}

module.exports = new FileUtils();
