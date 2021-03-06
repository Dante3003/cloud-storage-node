const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const cors = require("./middlware/corsMiddlware");
const fileUpload = require("express-fileupload");

const authRoutes = require("./routes/auth");
const fileRoutes = require("./routes/file");

const app = express();
const PORT = config.get("serverPort");
const HOST = config.get("serverHost");

app.use(fileUpload({}));
app.use(express.json());
app.use(cors);
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);

const startServer = () => {
  try {
    mongoose.connect(config.get("dbUrl"));
    app.listen(PORT, HOST, () => {
      console.log(`server started at ${HOST}:${PORT}`);
    });
  } catch (err) {
    console.log(err);
  }
};

startServer();
