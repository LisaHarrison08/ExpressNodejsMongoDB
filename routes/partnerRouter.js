// router handles get put post and delete endpoints for any path that begins with /campsite
const express = require('express');
const Partner = require('../models/partner');
const partnerRouter = express.Router();

partnerRouter
  .route('/')
  // next routing method set up an endpoint for a get request to the path '/partners'
  .get((req, res, next) => {
    Partner.find()
      .then((partners) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partners);
      })
      .catch((err) => next(err));
  })
  //post request not supported on this path, not accepting any requests to this endpoint - but send message back
  .post((req, res, next) => {
    Partner.create(req.body)
      .then((partner) => {
        console.log('Partner Created', partner);
        (res.statusCode = 200),
          res.setHeader('Content-Type', 'application/json');
        res.json(partner);
      })
      .catch((err) => next(err));
  })
  .put((req, res) => {
    res.statusCode = 403;
    res.end('PUT operation not supported on /partners');
  })
  .delete((req, res, next) => {
    Partner.deleteMany()
      .then((response) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      })
      .catch((err) => next(err));
  });

// Add a new partnerRouter.route() method, and as its argument, give it the path (route parameter) of '/:partnerId'
// 4 more endpoints that support a different path, route parameter added :partnerId

partnerRouter
  .route('/:partnerId')
  .get((req, res, next) => {
    Partner.findById(req.params.partnerId)
      .then((partner) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
      })
      .catch((err) => next(err));
  })
  .post((req, res) => {
    res.statusCode = 403;
    res.end(
      `POST operation not supported on /partners/${req.params.partnerId}`
    );
  })

  .put((req, res, next) => {
    Partner.findByIdAndUpdate(
      req.params.partnerId,
      {
        $set: req.body,
      },
      { new: true }
    )
      .then((partner) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(partner);
      })
      .catch((err) => next(err));
  })

  .delete((req, res, next) => {
    Partner.findByIdAndDelete(req.params.partnerId)
      .then((response) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(response);
      })
      .catch((err) => next(err));
  });

module.exports = partnerRouter;