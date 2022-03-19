const express = require('express');
const authenticate = require('../authenticate');
const multer = require('multer');
const cors = require('./cors');

// 1st argument null, there's no error, 2nd argument is path want to save the file to "public/images"
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    // file.originalname, ensures that the file on the server will be the same as file on the client side
    filename: (req, file, cb) => {
        cb(null, file.originalname)
    }
});


const imageFileFilter = (req, file, cb) => {
    // setup a regex expression to search for a file extension
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    // null, no error and set to true for multer to accept the file
    cb(null, true);
};

// call multer function and configure to enable file uploads
const upload = multer({ storage: storage, fileFilter: imageFileFilter });


const uploadRouter = express.Router();

uploadRouter.route('/')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('GET operation not supported on /imageUpload');
    })
    // include multer middleware upload.single('imageFile')
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, upload.single('imageFile'), (req, res) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(req.file);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /imageUpload');
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('DELETE operation not supported on /imageUpload');
    });

module.exports = uploadRouter;
