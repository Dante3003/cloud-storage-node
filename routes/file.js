const router = require("express").Router();
const authMiddleware = require("../middlware/authMiddleware");
const fileController = require("../controllers/fileController");

router.post("", authMiddleware, fileController.createDir);
router.post("/upload", authMiddleware, fileController.uploadFile);
router.get("", authMiddleware, fileController.getFiles);
router.get("/public", authMiddleware, fileController.getPublicFiles);
router.get("/download", authMiddleware, fileController.downloadFile);
router.delete("/", authMiddleware, fileController.deleteFile);
router.put("", authMiddleware, fileController.toggleFileAccess);

module.exports = router;
