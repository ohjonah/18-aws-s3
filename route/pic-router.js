'use strict'

const fs = require('fs');
const path = require('path');
const del = require('del');
const AWS = require('aws-sdk');
const multer = require('multer');
const Router = require('express').Router;
const createError = require('http-errors');
const debug = require('debug')('rolodex:pic-router');

const Pic = require('../model/pic.js');
const Contact = require('../model/contact.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

AWS.config.setPromisesDependency(require('bluebird'));

const s3 = new AWS.S3();
const dataDir = `${__dirname}/../data`;
const upload = multer({ dest: dataDir });

const picRouter = module.exports = Router();

function s3uploadProm(params) {
  return new Promise((resolve, reject) => {
    s3.upload(params, (err, s3data) => {
      resolve(s3data);
    });
  });
}

function s3deleteProm(params) {
  return new Promise((resolve, reject) => {
    s3.deleteObject(params, (err, s3data) => {
      resolve(s3data);
    });
  });
}

picRouter.post('/api/contact/:contactID/pic', bearerAuth, upload.single('image'), function(req, res, next) {
  debug('POST: /api/contact/:contactID/pic');

  if (!req.file) return next(createError(400, 'file not found'));
  if (!req.file.path) return next(createError(500, 'file not saved'));

  let ext = path.extname(req.file.originalname);

  let params = {
    ACL: 'public-read',
    Bucket: process.env.AWS_BUCKET,
    Key: `${req.file.filename}${ext}`,
    Body: fs.createReadStream(req.file.path)
  };

  Contact.findById(req.params.contactID)
  .then( () => s3uploadProm(params))
  .then( s3data => {
    del([`${dataDir}/*`]);

    let picData = {
      name: req.body.name,
      desc: req.body.desc,
      objectKey: s3data.Key,
      imageURI: s3data.Location,
      userID: req.user._id,
      contactID: req.params.contactID
    };

    return new Pic(picData).save();
  })
  .then( pic => res.json(pic))
  .catch( err => next(err));
});

// picRouter.delete('/api/contact/:contactID/pic', bearerAuth, function(req, res, next) {
//   debug('DELETE: /api/contact/:contactID/pic');
//
//   if (!req.file) return next(createError(400, 'file not found'));
//   if (!req.file.path) return next(createError(500, 'file not saved'));
//
//   let params = {
//     Bucket: process.env.AWS_BUCKET,
//     Key: `${req.file.filename}${ext}`
//   };
//
//   Contact.findById(req.params.contactID)
//   .then( () => s3deleteProm(params))
//
// });