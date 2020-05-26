/**
 * ArchivosController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */
let Procedures = Object();
const skipper = require('skipper-s3');
Procedures.file = async(req, res)=>{

    /*req.file('file').upload({
      dirname: require('path').resolve(sails.config.appPath, 'assets/images')
    },function (err, uploadFiles) {
      if (err) return res.serverError(err);
      //sails.log.info(98, uploadFiles);
      uploadFiles = uploadFiles[0].fd;
      uploadFiles = (uploadFiles.split("images"))[1];
      res.ok('images'+uploadFiles);
    });*/

    req.file('file').upload({
      adapter: skipper,
      key: 'AKIAIODH7ZEL3C6GG3AA',
      secret: '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',
      bucket: 'publihazclick/locompro'
    }, async (err, filesUploaded) => {
        if (err) return res.serverError(err);
        // console.log(filesUploaded)
        return res.ok({
            status: 200,
            files: "https://s3.amazonaws.com/publihazclick/locompro/"+filesUploaded[0].fd,
            textParams: req.allParams()
        });
    });

    /*req.file('file').upload({
        //dirname: require('path').resolve(sails.config.appPath, 'assets/images')
        dirname: require('path').resolve(sails.config.appPath, '.tmp/public/images')
    },function (err, uploadFiles) {
        if(err){
            return reject(err);
        }
        // sails.log.info(98, uploadFiles);
        req.file('file').upload(function (err, uploadFiles) {
            if(err){
                return reject(err);
            }
            // sails.log.info(98, uploadFiles);
            uploadFiles = uploadFiles[0].fd;
            uploadFiles = (uploadFiles.split("images"))[1];
            res.ok('images'+uploadFiles);
        })
        ;
        //res.ok(uploadFiles);
    })
    ;*/
}

module.exports = Procedures;

