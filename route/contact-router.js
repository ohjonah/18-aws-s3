'use strict';

const Router = require('express').Router;
const jsonParser = require('body-parser').json();
const createError = require('http-errors');
const debug = require('debug')('rolodex:contact-router');

const Contact = require('../model/contact.js');
const bearerAuth = require('../lib/bearer-auth-middleware.js');

const contactRouter = module.exports = Router();

contactRouter.post('/api/contact', bearerAuth, jsonParser, function(req, res, next) {
  debug('POST: /api/contact');

  if (Object.keys(req.body).length === 0) return next(createError(400, 'Bad Request'));

  req.body.userID = req.user._id;

  new Contact(req.body).save()
  .then( contact => res.json(contact))
  .catch(next);
});

contactRouter.get('/api/contact/:id', bearerAuth, function(req, res, next) {
  debug('GET: /api/contact/:id');

  Contact.findById(req.params.id)
  .then( contact => res.json(contact))
  .catch(err => next(createError(404, err.message)));
});

contactRouter.put('/api/contact/:id', bearerAuth, jsonParser, function(req, res, next) {
  debug('PUT: /api/contact');

  if (Object.keys(req.body).length === 0) return next(createError(400, 'Bad Request'));

  Contact.findByIdAndUpdate(req.params.id, req.body, { new: true })
  .then( contact => res.json(contact))
  .catch( err => next(createError(404, err.message)));
});

contactRouter.delete('/api/contact/:id', bearerAuth, function(req, res, next) {
  debug('DELETE: /api/contact');

  Contact.findByIdAndRemove(req.params.id)
  .then( () => res.status(204).send())
  .catch( err => next(createError(404, err.message)));
});
