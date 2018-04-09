// loads configuration file
var config      = require('./config');

// loads required packages
var mongoose    = require('mongoose');
var morgan      = require('morgan');
var bodyParser  = require('body-parser');
var express     = require('express');

// instantiates the Express "app"
app = express();

// sets app to use bodyParser in order to extract data from POST body and query
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// logs requests in console (debugging)
app.use(morgan('dev'));

// -----------------------------------------------------
// inits db connection

mongoose.Promise = global.Promise;  // I put this because something was failing, but I don't remember exactly what was :-O
// mongoose.Promise = require('mpromise');  // I put this because something was failing, but I don't remember exactly what was :-O
mongoose.connect(config.db.url, { user: config.db.user, pass: config.db.password });

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'Database connection failed'));
db.once('open', function () {
    console.log('Database connection opened');
});
db.once('close', function () {
    console.log('Database connection closed');
});

// -----------------------------------------------------
// inits express app

// adds a middleware function for all requests
// app.use((req, res, next) => {
//     console.log(req.path);
//     next();
// });

// registers issues API route in express app
app.use('/api/issue', require('./app/apis/issue-api'));

// registers users API route in express app
app.use('/api/user', require('./app/apis/user-api'));

// starts the server
app.listen(config.port, function () {
    console.log('API up on port ' + config.port);
});
