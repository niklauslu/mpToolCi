const fs = require("fs");
const archiver = require("archiver");
// const unzip = require("unzip");
const compressing = require("compressing");

class Zip {
  zip(destPath, sourcePath) {
    return new Promise((r, j) => {
      let output = fs.createWriteStream(destPath);
      let archive = archiver("zip", {
        zlib: { level: 9 }, // Sets the compression level.
      });

      // archive.symlink("/", sourcePath)
      archive.pipe(output);

      archive.glob(sourcePath);

      output.on("close", function () {
        console.log(archive.pointer() + " total bytes");
        r(true);
        // console.log('archiver has been finalized and the output file descriptor has closed.');
      });

      output.on("end", function () {
        console.log("Data has been drained");
        // r(true)
      });

      archive.on("error", function (err) {
        // throw err;
        j(err);
      });

      archive.finalize();
    });
  }

  zipFiles(destPath, files, replaceStr = "") {
    return new Promise((r, j) => {
      let output = fs.createWriteStream(destPath);
      let archive = archiver("zip", {
        zlib: { level: 9 }, // Sets the compression level.
      });

      // archive.symlink("/", sourcePath)
      archive.pipe(output);

      // archive.glob(sourcePath);
      files.forEach((file) => {
        let name = file.replace(replaceStr, "");
        archive.append(fs.createReadStream(file), { name: name });
      });

      output.on("close", function () {
        console.log(archive.pointer() + " total bytes");
        r(true);
        // console.log('archiver has been finalized and the output file descriptor has closed.');
      });

      output.on("end", function () {
        console.log("Data has been drained");
        // r(true)
      });

      archive.on("error", function (err) {
        // throw err;
        j(err);
      });

      archive.finalize();
    });
  }

  // 解压
  async unzip(zipPath, targetPath) {
    //判断压缩文件是否存在
    if (!fs.existsSync(zipPath)) {
      return false;
    }

    await compressing.zip.uncompress(zipPath, targetPath);
    return true;
  }
}

module.exports = new Zip();
