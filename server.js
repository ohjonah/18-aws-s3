'use strict';

const express = require('express');
const debug = require('debug')('rolodex:server.js');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const authRouter = require('./route/auth-router.js');
const contactRouter = require('./route/contact-router.js');
const picRouter = require('./route/pic-router.js');
const errors = require('./lib/error-middleware.js');
const Promise = require('bluebird');

dotenv.load();
const app = express();
const PORT = process.env.PORT || 8000;

mongoose.Promise = Promise;

mongoose.connect(process.env.MONGODB_URI, {
  useMongoClient: true
});

app.use(cors());
app.use(morgan('dev'));
app.use(authRouter);
app.use(contactRouter);
app.use(picRouter);
app.use(errors);

app.listen(PORT, () => debug(`Server on PORT ${PORT}`));
