    const aws = require('aws-sdk');
    const multer = require('multer');
    const multerS3 = require('multer-s3');
    require('dotenv').config();

    aws.config.update({
        secretAccessKey: process.env.AWSACCESSKEY,
        accessKeyId: process.env.AWSACCESSID,
        region: 'eu-west-2'
    });

    const s3 = new aws.S3();
  
    const upload = multer({
        storage: multerS3({
          s3: s3,
          bucket: process.env.S3_BUCKET,
          metadata: function (req, file, cb) {
            cb(null, {fieldName: file.fieldname});
          },
          contentType:  multerS3.AUTO_CONTENT_TYPE,
          key: function (req, file, cb) {
            var newFileName = Date.now() + "-" + file.originalname;
            var fullPath = 'images/'+ newFileName;
            cb(null, fullPath);
          }
        })
      });
  
    module.exports = {upload: upload, s3: s3};
    