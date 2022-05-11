const fs = require("fs");
const config = require("config");

function FileService() {
  this.createDir = function (file) {
    const filePath = `${config.get("filePath")}\\${file.user}\\${file.path}`;
    return new Promise((resolve, reject) => {
      try {
        if (!fs.existsSync(filePath)) {
          fs.mkdir(filePath, (err) => console.log(err));
          return resolve({ message: "File was created" });
        } else {
          return reject({ message: "File already exist" });
        }
      } catch (err) {
        console.log(err);
        return reject({ message: "File Error" });
      }
    });
  };
  this.deleteFile = function (file) {
    const path = this.getPath(file);
    if (file.type === "dir") {
      fs.rmdirSync(path);
    } else {
      fs.unlinkSync(path);
    }
  };
  this.getPath = function (file) {
    return `${config.get("filePath")}\\${file.user}\\${file.path}`;
  };
}

module.exports = new FileService();
