// router handles get put post and delete endpoints for any path that begins with /campsite
const express = require('express');

// Require the campsite.js file - to be able to use the Campsite model exported from that module
const Campsite = require('../models/campsite');
const authenticate = require('../authenticate');

//  import cors module
const cors = require('./cors');

//create a new express router
const campsiteRouter = express.Router();

// Protect resources: Update all REST API endpoints to authorize only admin accounts to access specific endpoints:authenticate.verifyAdmin
campsiteRouter.route('/')
    // next routing method set up an endpoint for a get request to the path '/campsites'
    //  add the options method to handle pre flight requests
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    // insert cors middleware for get request
    .get(cors.cors, (req, res, next) => {
        Campsite.find()
            .populate('comments.author')
            .then(campsites => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsites);
            })
            .catch(err => next(err));
    })
    // handle endpoint for post requests
    // insert custom cors middleware set up to use with whitelist
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // .create method to create a new campsite document and save it to the mongoDB server. Create a document from the request body which will contain the info for the campsite to post from the client. Through this create method mongoose will automatically check the date to make sure it fits that schema
        // create method will return a promise - use .then to handle the promise 
        Campsite.create(req.body)
            .then(campsite => {
                console.log('Campsite Created ', campsite);
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })

    //reject the request to this endpoint - operation is not supported
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end('PUT operation not supported on /campsites');
    })
    // request to delete all the campsites. pass inthe next function for error handling
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        // then method to access the return value from this operation which will give us information in the response object which will give us info about how many documents were deleted
        Campsite.deleteMany()
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

// Add a new campsiteRouter.route() method, and as its argument, give it the path (route parameter) of '/:campsiteId'
// 4 more endpoints that support a different path, route parameter added :campsiteId

campsiteRouter.route('/:campsiteId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .populate('comments.author')
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })

    //post request not supported on this path, not accepting any requests to this endpoint - but send message back
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}`);
    })

    // send a multi-line response res.write \n res.end
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.findByIdAndUpdate(req.params.campsiteId, {
            $set: req.body
        }, { new: true })
            .then(campsite => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(campsite);
            })
            .catch(err => next(err));
    })
    //endpoint is used for deleting a specific campsite
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.findByIdAndDelete(req.params.campsiteId)
            .then(response => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(response);
            })
            .catch(err => next(err));
    });

campsiteRouter.route('/:campsiteId/comments')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .populate('comments.author')
            .then(campsite => {
                if (campsite) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite.comments);
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite) {
                    req.body.author = req.user._id; // add id of the current user to the request body as the author before it gets pushed into the comments array
                    campsite.comments.push(req.body);
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end(`PUT operation not supported on /campsites/${req.params.campsiteId}/comments`);
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite) {
                    for (let i = (campsite.comments.length - 1); i >= 0; i--) {
                        campsite.comments.id(campsite.comments[i]._id).remove();
                    }
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                } else {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });

campsiteRouter.route('/:campsiteId/comments/:commentId')
    .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
    .get(cors.cors, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .populate('comments.author')
            .then(campsite => {
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(campsite.comments.id(req.params.commentId));
                } else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
        res.statusCode = 403;
        res.end(`POST operation not supported on /campsites/${req.params.campsiteId}/comments/${req.params.commentId}`);
    })
    .put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    if (req.body.rating) {
                        campsite.comments.id(req.params.commentId).rating = req.body.rating;
                    }
                    if (req.body.text) {
                        campsite.comments.id(req.params.commentId).text = req.body.text;
                    }
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                } else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    })
    .delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
        Campsite.findById(req.params.campsiteId)
            .then(campsite => {
                if (campsite && campsite.comments.id(req.params.commentId)) {
                    campsite.comments.id(req.params.commentId).remove();
                    campsite.save()
                        .then(campsite => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(campsite);
                        })
                        .catch(err => next(err));
                } else if (!campsite) {
                    err = new Error(`Campsite ${req.params.campsiteId} not found`);
                    err.status = 404;
                    return next(err);
                } else {
                    err = new Error(`Comment ${req.params.commentId} not found`);
                    err.status = 404;
                    return next(err);
                }
            })
            .catch(err => next(err));
    });

//export the campsiteRouter to use
module.exports = campsiteRouter;