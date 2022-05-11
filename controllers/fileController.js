const fs = require("fs");
const fileService = require("../services/fileService");
const User = require("../models/User");
const File = require("../models/File");
const config = require("config");

async function findFilesAndSort(searchOptions = {}, sortOptions = {}) {
  return await File.find(searchOptions).sort(sortOptions);
}

function FileController() {
  this.createDir = async function (req, res) {
    try {
      const { name, type, parent } = await req.body;
      const file = new File({
        name,
        type,
        parent: parent || null,
        user: req.user.id,
      });
      const parentFile = await File.findOne({ _id: parent || null });
      if (!parentFile) {
        file.path = name;
        await fileService.createDir(file);
      } else {
        file.path = `${parentFile.path}\\${file.name}`;
        await fileService.createDir(file);
        parentFile.childs.push(file._id);
        await parentFile.save();
      }
      await file.save();
      return res.json(file);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Server error" });
    }
  };
  this.getFiles = async function (req, res) {
    try {
      const { sort } = req.query;
      const searchFile = req.query.search;
      let files = null;
      const parent = req.query.parent || null;
      switch (sort) {
        case "name":
          files = await File.find({ user: req.user.id, parent: parent }).sort({
            name: 1,
          });
          break;
        case "type":
          files = await File.find({ user: req.user.id, parent: parent }).sort({
            type: 1,
          });
          break;
        default:
          files = await File.find({ user: req.user?.id, parent: parent });
      }
      if (searchFile) {
        files = files.filter((file) =>
          file.name.toLowerCase().includes(searchFile.toLowerCase())
        );
      }
      return res.json(files);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Server Error" });
    }
  };
  this.uploadFile = async function (req, res) {
    try {
      const file = req.files.file;

      const parent = await File.findOne({
        user: req.user.id,
        _id: req.body.parent,
      });
      const user = await User.findOne({ _id: req.user.id });

      if (user.usedSpace + file.size > user.diskSpace) {
        return res.status(400).json({ message: "There no space on the disk" });
      }

      user.usedSpace = user.usedSpace + file.size;

      let path;
      if (parent) {
        path = `${config.get("filePath")}\\${user._id}\\${parent._id}\\${
          file.name
        }`;
      } else {
        path = `${config.get("filePath")}\\${user._id}\\${file.name}`;
      }
      if (fs.existsSync(path)) {
        return res.status(400).json({ message: "File already exist" });
      }

      file.mv(path);
      const type = file.name.split(".").pop();
      const filePath = file.name;
      if (parent) {
        filePath = `${parent.path}\\${file.name}`;
      }
      const dbFile = new File({
        name: file.name,
        type,
        size: file.size,
        path: filePath,
        parent: parent?.id,
        user: user._id,
      });

      await dbFile.save();
      await user.save();

      res.json(dbFile);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Server Error" });
    }
  };
  this.downloadFile = async function (req, res) {
    try {
      const file = await File.findOne({ _id: req.query.id, user: req.user.id });
      const path = fileService.getPath(file);

      if (fs.existsSync(path)) {
        return res.download(path, file.name);
      }

      return res
        .status(400)
        .json({ message: "File not found on cloude storage" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Download error" });
    }
  };
  this.deleteFile = async function (req, res) {
    try {
      const file = await File.findOne({ _id: req.query.id, user: req.user.id });
      if (!file) {
        return res.status(404).json({ message: "File not found", error: true });
      }
      fileService.deleteFile(file);
      await file.remove();
      return res.status(200).json({ message: "File deleted", error: false });
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error", error: true });
    }
  };
  this.getPublicFiles = async function (req, res) {
    try {
      const { sort } = req.query;
      const searchFile = req.query.search;
      let files = null;
      const parent = req.query.parent || null;
      switch (sort) {
        case "name":
          files = await findFilesAndSort(
            { parent: parent, public: true },
            { name: 1 }
          );
          break;
        case "type":
          files = await findFilesAndSort(
            { parent: parent, public: true },
            { type: 1 }
          );
          break;
        default:
          files = await findFilesAndSort({ parent: parent, public: true });
      }
      if (searchFile) {
        files = files.filter((file) =>
          file.name.toLowerCase().includes(searchFile.toLowerCase())
        );
      }
      return res.json(files);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Server Error" });
    }
  };
  this.toggleFileAccess = async function (req, res) {
    try {
      const file = await File.findOne({ _id: req.body.id, user: req.user.id });
      if (!file) {
        return res.status(404).json({ message: "File not found", error: true });
      }
      file.public = !file.public;
      await file.save();
      return res
        .status(200)
        .json({ message: "File access changed", error: false });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: true });
    }
  };
}

module.exports = new FileController();
