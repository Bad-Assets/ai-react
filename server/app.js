// require('dotenv').config();
const path = require('path');
const express = require('express');
const compression = require('compression');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
// const mongoose = require('mongoose');

const expressHandlebars = require('express-handlebars');
// const session = require('express-session');

const router = require('./router.js');
const socketSetup = require('./io.js');

// Port set by process.env.PORT environment variable.
// If the process.env.PORT variable or the env.NODE_PORT variables do not exist, use port 3000
const port = process.env.PORT || process.env.NODE_PORT || 3000;

// const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/ConstellationCove';

// call mongoose's connect function and pass in the url.
// If there are any errors connecting, we will throw it and kill the server.
// Once connected, the mongoose package will stay connected for every file
// that requires it in this project
// mongoose.connect(dbURI).catch((err) => {
//   if (err) {
//     console.log('Could not connect to database');
//     throw err;
//   }
// });

const app = express();

// app.use tells express to use different options
// This option tells express to use /assets in a URL path as a static mirror to our client folder
// Any requests to /assets will map to the client folder to find a file
// For example going to /assets/img/favicon.png would return the favicon image
app.use('/assets', express.static(path.resolve(`${__dirname}/../hosted`)));
app.use(favicon(`${__dirname}/../hosted/media/cove-logo.png`));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', expressHandlebars.engine({ defaultLayout: '' }));
app.set('view engine', 'handlebars');
app.set('views', `${__dirname}/../views`);

router(app);
const server = socketSetup(app);

server.listen(port, (err) => {
  if (err) { throw err; }
  console.log(`Listening on port ${port}`);
});
