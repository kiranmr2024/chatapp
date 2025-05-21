const express = require("express");
const { upload, uploadMedia } = require("../controllers/uploadcontroller");

const router = express.Router();
router.post("/upload", upload.single("file"), uploadMedia);

module.exports = router;
