var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser= require('body-parser');
var cors = require('cors');
var ejs = require('ejs');
const multer = require('multer');
var logger = require('morgan');
var mongoose = require('mongoose');
var passport= require('passport');
const session=require('express-session');
var config=require('./public/javascripts/config/database');

mongoose.Promise = global.Promise;
mongoose
.connect(config.db, {
useUnifiedTopology: true,
useNewUrlParser: true,
})
.then(() => console.log('DB Connected!'))
.catch(err => {
console.log('DB Connection Error: ${err.message}');
});

var indexRouter = require('./routes/index');
var userRouter = require('./routes/users');
var postRouter = require('./routes/post');

var app = express();
var port=3000;

// view engine setup
//original
//app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//mine
//app.engine('html', require('ejs').renderFile);
//app.set('view engine', 'html');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(logger('dev'));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use('/', indexRouter);
app.use('/post',postRouter);
app.use('/user',userRouter);

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
  res.render('./error404');
});

app.listen(port, () => console.log(`Hello world app listening on port ${port}!`))

module.exports = app;
