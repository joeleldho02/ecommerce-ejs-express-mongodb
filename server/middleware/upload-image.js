// const multer = require("multer");

// const imageFilter = (req, file, cb) => {
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb("Please upload only images.", false);
//   }
// };

// var storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, __basedir + "/resources/static/assets/uploads/");
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-bezkoder-${file.originalname}`);
//   },
// });

// var uploadFile = multer({ storage: storage, fileFilter: imageFilter });
// module.exports = uploadFile;

const path = require('path');

const multer  = require('multer');
const storage1 = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, path.join('D:/BROTOTYPE/PROJECTS/ecommerce-jmj-music-house/public/img/products'));
    },
    filename: function(req, file, cb){
        const name = Date.now() + "-" + file.originalname;
        cb(null, name);
    }
})
exports.uploadProductImage = multer({ storage: storage1 });

const storage2 = multer.diskStorage({
  destination: function(req, file, cb){
      cb(null, path.join('D:/BROTOTYPE/PROJECTS/ecommerce-jmj-music-house/public/img/banners'));
  },
  filename: function(req, file, cb){
      const name = Date.now() + "-" + file.originalname;
      cb(null, name);
  }
})
exports.uploadBannerImage = multer({ storage: storage2 });

const storage3 = multer.diskStorage({
  destination: function(req, file, cb){
      cb(null, path.join('D:/BROTOTYPE/PROJECTS/ecommerce-jmj-music-house/public/img/users'));
  },
  filename: function(req, file, cb){
      const name = Date.now() + "-" + file.originalname;
      cb(null, name);
  }
})
exports.uploadUserImage = multer({ storage: storage3 });

const storage4 = multer.diskStorage({
  destination: function(req, file, cb){
      cb(null, path.join('D:/BROTOTYPE/PROJECTS/ecommerce-jmj-music-house/public/img/category'));
  },
  filename: function(req, file, cb){
      const name = Date.now() + "-" + file.originalname;
      cb(null, name);
  }
})
exports.uploadCategoryImage = multer({ storage: storage4 });


const sharp = require("sharp");
exports.resizeImages = async (req, res, next) => {
  if (!req.files) return next();
  console.log("Resizing images ==========>>>>");
  req.body.images = [];
  await Promise.all(
    req.files.map(async file => {
      const newFilename = "r_" + file.filename;
      console.log("Resizing image ----- " + newFilename);
      await sharp(file.path)
        .resize(440, 440)
        .toFormat("png")
        .png({ quality: 90 })
        .toFile(`D:/BROTOTYPE/PROJECTS/ecommerce-jmj-music-house/public/img/products/${newFilename}`);

      req.body.images.push(newFilename);
    })
  );
  console.log("Passing images to next middleware");
  next();
};
