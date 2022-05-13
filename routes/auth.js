const router = require("express").Router();
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
// const { check, validationResult } = require('express-validator');
const User = require("../models/User");
const authMiddleware = require("../middlware/authMiddleware");
const fileService = require("../services/fileService");
const File = require("../models/File");

router.get("/", async (req, res) => {
  console.log("Worked!!!");
  res.status(200).send("Worked!!!!");
});

router.post("/registration", async (req, res) => {
  try {
    const { name, email, password } = await req.body;
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const condidate = await User.findOne({ email });

    if (condidate) {
      return res
        .status(400)
        .json({ message: `User with email ${email} already exists` });
    }

    const user = new User({ name: name, email: email, password: hashPassword });
    await user.save();
    await fileService.createDir(new File({ user: user.id, name: "" }));
    return res.json({ user: { name: user.name, email: user.email } });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = await req.body;
    const currentUser = await User.findOne({ email });
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const validPassword = await bcrypt.compare(password, currentUser.password);
    !validPassword && res.send("Wrong password");
    const token = jwt.sign({ id: currentUser.id }, config.get("secretKey"), {
      expiresIn: "5h",
    });
    return res.json({
      token,
      user: {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        diskSpace: currentUser.diskSpace,
        usedSpace: currentUser.usedSpace,
        avatar: currentUser.avatar,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const token = jwt.sign({ id: user.id }, config.get("secretKey"), {
      expiresIn: "5h",
    });
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        diskSpace: user.diskSpace,
        usedSpace: user.usedSpace,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;
