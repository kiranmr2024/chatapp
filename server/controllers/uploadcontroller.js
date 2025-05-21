const cloudinary = require("../utils/cloudinary");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadMedia = async (req, res) => {
  try {
    const file = req.file;
    const type = file.mimetype.startsWith("image") ? "image" : "raw";

    const result = await cloudinary.uploader.upload_stream(
      { resource_type: type },
      (error, result) => {
        if (error) return res.status(500).json({ error });
        return res.json({ url: result.secure_url, type: file.mimetype });
      }
    );

    result.end(file.buffer);
  } catch (err) {
    res.status(500).json({ error: "Upload failed" });
  }
};

module.exports = { upload, uploadMedia };
