require('dotenv').config();
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const expressHandlebars = require('express-handlebars');
const helmet = require('helmet');
const session = require('express-session');
const RedisStore = require('connect-redis').default;
const redis = require('redis');

const router = require('./router.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/SpellingBee';
mongoose.connect(dbURI).catch((err) => {
    if (err) {
        console.log('Could not connect to database');
        throw err;
    }
});

const redisClient = redis.createClient({
    url: process.env.REDISCLOUD_URL,
});