var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');

var indexRouter = require('./routes/index');
var dbfakeRouter = require('./routes/db_fake_data');
var userRouter = require('./routes/users');
var companyRouter = require('./routes/company');
var serverRouter = require('./routes/server');
var customergroupRouter = require('./routes/customergroup')
var alertsRouter = require('./routes/alerts')

var cors = require('cors');

/**
 * for test 
 */
var dateFormat = require('dateformat');
var start = Date.now();
console.log(dateFormat(start, "yyyy-mm-dd 00:00:00"));

//-------------------------------------------

require('dotenv').config();

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.use('/', indexRouter);
app.use('/', dbfakeRouter);
app.use('/', userRouter);
app.use('/', companyRouter);
app.use('/', serverRouter);
app.use('/', customergroupRouter)
app.use('/', alertsRouter)


let allowCrossDomain = function(req, res, next) {
  res.header('Access-Controll-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', "*");
  res.header('Access-Control-Allow-Headers', "*");
  next();
}
app.use(allowCrossDomain);

// catch 404 and forward to error handler
app.use(function(req, res, next) {

  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
const port = process.env.PORT || 9010;
app.listen(port, function() {
    console.log('Express API is listening on port: %s', port);
});