require('dotenv').config();
const path = require('path'); // path is a built-in node library to handle file system paths
const express = require('express'); // express is a popular Model-View-Controller framework for Node
const compression = require('compression'); // compression library to gzip responses for smaller/faster transfer
const favicon = require('serve-favicon'); // favicon library to handle favicon requests
const bodyParser = require('body-parser'); // library to handle POST requests any information sent in an HTTP body
const mongoose = require('mongoose'); // Mongoose is one of the most popular MongoDB libraries for node
const http = require('http'); // http is a built-in node library to handle http traffic

// const expressHandlebars = require('express-handlebars');
const session = require('express-session');

const router = require('./router.js');

// Port set by process.env.PORT environment variable.
// If the process.env.PORT variable or the env.NODE_PORT variables do not exist, use port 3000
const port = process.env.PORT || process.env.NODE_PORT || 3000;

const dbURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1/ConstellationCove';

// call mongoose's connect function and pass in the url.
// If there are any errors connecting, we will throw it and kill the server.
// Once connected, the mongoose package will stay connected for every file
// that requires it in this project
mongoose.connect(dbURI).catch((err) => {
  if (err) {
    console.log('Could not connect to database');
    throw err;
  }
});

const app = express();
http.createServer(app);
const io = require('socket.io')(http);

// app.use tells express to use different options
// This option tells express to use /assets in a URL path as a static mirror to our client folder
// Any requests to /assets will map to the client folder to find a file
// For example going to /assets/img/favicon.png would return the favicon image
app.use('/assets', express.static(path.resolve(`${__dirname}/../client/media`)));
app.use(favicon(`${__dirname}/../client/media/cove-logo.png`));
app.use(compression());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  key: 'sessionid',
  secret: 'Constellation Cove',
  resave: false,
  saveUninitialized: false,
}));
app.static();

io.on('connection', (socket) => {
  console.log('a user connected');
});

router(app);

app.listen(port, (err) => {
  if (err) { throw err; }
  console.log(`Listening on port ${port}`);
});