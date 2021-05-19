var createError = require('http-errors');
var express = require('express');
var path = require('path');
var passport          =     require('passport')
var FacebookStrategy  =     require('passport-facebook').Strategy
var auth           =     require('./config/auth')
var dotenv = require('dotenv')
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session=require('express-session')
var adminRouter = require('./routes/admin');
var userRouter = require('./routes/users');
var doctorRouter=require('./routes/doctor');
var hbs=require('express-handlebars')
var db=require('./config/connection')
var collection=require('./config/collections')
var fileUpload=require('express-fileupload')
const flash = require('connect-flash');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout/',partialsDir:__dirname+'/views/partials'}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));




app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({secret:"key",cookie:{maxAge:600000}}))
app.use(fileUpload());
app.use(passport.initialize());
app.use(passport.session());
app.use (flash());
db.connect((err)=>{
if(err) console.log('connection error')
else
console.log("database connected");
})


app.use('/', userRouter);
app.use('/admin', adminRouter);
app.use('/doctor',doctorRouter);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
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
