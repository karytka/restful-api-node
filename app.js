const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
require('body-parser-xml')(bodyParser);

const index = require('./routes/index');
const clubs = require('./routes/clubs');
const players = require('./routes/players');
const doctors = require('./routes/doctors');

const app = express();

app.use(favicon(path.join(__dirname, 'public', 'node.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.xml());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/clubs', clubs);
app.use('/players', players);
app.use('/doctors', doctors);

// catch 404 and forward to error handler
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.send(err.message);
});

module.exports = app;
