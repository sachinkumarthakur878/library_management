const ImageKit = require("imagekit");
const multer = require("multer");

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

// Multer memory storage - file buffer ko ImageKit pe bhejenge
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/jpg"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only jpg, jpeg, png images are allowed"), false);
    }
  },
});

// ImageKit pe image upload karne ka helper function
const uploadToImageKit = (fileBuffer, fileName, folder = "library_books") => {
  return new Promise((resolve, reject) => {
    imagekit.upload(
      {
        file: fileBuffer,
        fileName: `${Date.now()}-${fileName}`,
        folder: folder,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
  });
};

// ImageKit se image delete karne ka helper function
const deleteFromImageKit = (fileId) => {
  return new Promise((resolve, reject) => {
    imagekit.deleteFile(fileId, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
  });
};

module.exports = { upload, imagekit, uploadToImageKit, deleteFromImageKit };