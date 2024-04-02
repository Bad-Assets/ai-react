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
// const RedisStore = require('connect-redis').default;
// const redis = require('redis');

const router = require('./router.js');

const port = process.env.PORT || process.env.NODE_PORT || 3000;

const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/SpellingBee';
mongoose.connect(dbURI).catch((err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

// const redisClient = redis.createClient({
//   url: process.env.REDISCLOUD_URL,
// });

// redisClient.on('error', (err) => console.log('Redis Client Error', err));

const app = express();

  app.use(helmet());
  app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted`)));
  app.use(favicon(`${__dirname}/../hosted/img/bee.png`));
  app.use(compression());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(session({
    key: 'sessionid',
    // store: new RedisStore({
    //   client: redisClient,
    // }),
    secret: 'Constellation Cove',
    resave: false,
    saveUninitialized: false,
  }));
  app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
  app.set('view engine', 'handlebars');
  app.set('views', `${__dirname}/../views`);

  router(app);

  app.listen(port, (err) => {
    if (err) { throw err; }
    console.log(`Listening on port ${port}`);
  });

// redisClient.connect().then(() => {
  
// });
