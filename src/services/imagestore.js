    const aws = require('aws-sdk');
    const multer = require('multer');
    const multerS3 = require('multer-s3');
    require('dotenv').config();

    /**
     * Sets up the configuration details for aws.
     */
    aws.config.update({
        secretAccessKey: "hQSKcsGWZbjvxhPAJiNe80uNjYU2UEppo0OSJUOu",
        accessKeyId: "AKIAI4CCWUT6PSIUIIVQ",
        region: 'eu-west-2'
    });

    const s3 = new aws.S3();
  
    /**
     * Creats a multer instance that lets you upload pictures to amazon aws s3.
     * @returns a callback with null or the filepath.
     */
    const upload = multer({
        storage: multerS3({
          s3: s3,
          bucket: "test123-njs",
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
    