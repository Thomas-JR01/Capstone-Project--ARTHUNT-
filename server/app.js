var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var helmet = require('helmet');
var bodyParser = require('body-parser');

var clientRouter = require('./routes/client-index');
var adminRouter = require('./routes/admin-index');
var game = require('./game/main');
var dbLog = require('./logging').dbLog;

var app = express();
game.init();

app.use(bodyParser.json({limit: require('./env.js').config.file_dir.max_size}))
app.use(cors());
app.use(helmet());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/client-api/', clientRouter);
app.use('/admin-api/', adminRouter);
app.use(dbLog);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log("\x1b[31m", "Error:", err.message);
  require('./logging').saveCriticalError(err.message);

  // render the error page
  res.json({
	  status: "error",
	  message: "Error on server somewhere not caught!"
  })
});

module.exports = app;
